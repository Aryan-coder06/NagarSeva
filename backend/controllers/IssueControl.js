const Issue = require('../models/Issue');
const Officer = require('../models/Officer');
const UserProfile = require('../models/UserProfile');
const analyzeImage = require('../utils/analyseImage');
const getLocation = require('../utils/getLocation');
const { logAction } = require('./logControl');

const CITY_ALIASES = {
    gurgaon: ['gurgaon', 'gurugram'],
    gurugram: ['gurgaon', 'gurugram'],
    bangalore: ['bangalore', 'bengaluru'],
    bengaluru: ['bangalore', 'bengaluru'],
};

const CATEGORY_ALIASES = {
    'road and transport': 'Roads & Transport',
    'roads and transport': 'Roads & Transport',
    'roads & transport': 'Roads & Transport',
    sanitation: 'Garbage & Sanitation',
    'garbage and sanitation': 'Garbage & Sanitation',
    'garbage & sanitation': 'Garbage & Sanitation',
    electricity: 'Street Lighting',
    'water and drainage': 'Water Supply & Drainage',
    'water supply and drainage': 'Water Supply & Drainage',
    'water supply & drainage': 'Water Supply & Drainage',
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const canonicalizeCategory = (value = '') => {
    const normalized = String(value).trim().toLowerCase();
    return CATEGORY_ALIASES[normalized] || String(value).trim();
};

const cityVariants = (value = '') => {
    const normalized = String(value).trim().toLowerCase();
    return CITY_ALIASES[normalized] || [normalized];
};

const resolveMunicipalCategories = (municipalityProfile = {}) => {
    const directCategories = Array.isArray(municipalityProfile.assignedCategories)
        ? municipalityProfile.assignedCategories.map((item) => canonicalizeCategory(item)).filter(Boolean)
        : [];

    if (directCategories.length) return [...new Set(directCategories)];

    const fallback = canonicalizeCategory(municipalityProfile.department || '');
    return fallback ? [fallback] : [];
};

const buildMunicipalIssueFilter = (profile) => {
    const municipalityProfile = profile?.municipalityProfile || {};
    const filter = {};
    const scope = {
        rawCity: municipalityProfile.city || '',
        normalizedCities: [],
        rawCategories: municipalityProfile.assignedCategories || [],
        normalizedCategories: [],
        state: municipalityProfile.state || '',
    };

    const normalizedCategories = resolveMunicipalCategories(municipalityProfile);
    scope.normalizedCategories = normalizedCategories;

    if (normalizedCategories.length) {
        filter.category = { $in: normalizedCategories };
    }

    if (municipalityProfile.state) {
        filter.state = { $regex: `^${municipalityProfile.state}$`, $options: 'i' };
    }

    if (municipalityProfile.city) {
        const variants = cityVariants(municipalityProfile.city);
        scope.normalizedCities = variants;
        filter.city = {
            $in: variants.map((variant) => new RegExp(`^${escapeRegex(variant)}$`, 'i')),
        };
    }

    return { filter, scope };
};

const severityScore = {
    low: 20,
    medium: 45,
    high: 70,
    critical: 90,
};

const urgencyScore = {
    scheduled: 5,
    soon: 10,
    urgent: 18,
    immediate: 25,
};

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistance = (a, b) => {
    const lat1 = toRadians(a.latitude);
    const lat2 = toRadians(b.latitude);
    const deltaLat = toRadians(b.latitude - a.latitude);
    const deltaLon = toRadians(b.longitude - a.longitude);

    const h = Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

    return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
};

const tokenize = (value = '') =>
    String(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 2);

const textOverlapScore = (a = '', b = '') => {
    const setA = new Set(tokenize(a));
    const setB = new Set(tokenize(b));
    if (!setA.size || !setB.size) return 0;

    const overlap = [...setA].filter((token) => setB.has(token)).length;
    return overlap / Math.max(setA.size, setB.size);
};

const computePriorityScore = (analysis = {}, votes = 0, duplicateClusterSize = 0, createdAt = new Date()) => {
    const severity = severityScore[String(analysis.severity || '').toLowerCase()] || 15;
    const urgency = urgencyScore[String(analysis.urgency || '').toLowerCase()] || 0;
    const confidence = Math.round(Number(analysis.confidence || 0) * 10);
    const voteBonus = Math.min(15, Number(votes || 0) * 2);
    const duplicateBonus = Math.min(12, Number(duplicateClusterSize || 0) * 4);
    const ageHours = Math.max(0, (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60));
    const ageBonus = Math.min(10, Math.floor(ageHours / 12) * 2);
    return Math.min(100, severity + urgency + confidence + voteBonus + duplicateBonus + ageBonus);
};

const inferCategoryFromMessage = (message = '') => {
    const text = String(message).toLowerCase();
    if (/(pothole|road|traffic|signal|street|footpath|bus stop|crossing)/.test(text)) return 'Roads & Transport';
    if (/(garbage|waste|trash|bin|dump)/.test(text)) return 'Garbage & Sanitation';
    if (/(water|drain|drainage|sewage|leak|pipeline)/.test(text)) return 'Water Supply & Drainage';
    if (/(light|streetlight|street light|electric)/.test(text)) return 'Street Lighting';
    if (/(manhole|unsafe|danger|hazard|open drain|broken)/.test(text)) return 'Public Safety';
    return 'Other';
};

const deriveTitleFromMessage = (message = '', category = 'Civic Issue') => {
    const cleaned = String(message).replace(/\s+/g, ' ').trim();
    if (!cleaned) return `${category} report`;

    const normalized = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    if (normalized.length <= 54) return normalized;

    const clipped = normalized.slice(0, 54).trim();
    return `${clipped}...`;
};

const detectDuplicateIssues = async ({ coordinates, category, userMessage }) => {
    if (!coordinates?.latitude || !coordinates?.longitude) {
        return {
            isLikelyDuplicate: false,
            duplicateOf: null,
            duplicateCandidates: [],
            duplicateClusterSize: 0,
        };
    }

    const openIssues = await Issue.find({
        status: { $in: ['open', 'pending', 'in progress'] },
        coordinates: { $exists: true },
    })
        .sort({ createdAt: -1 })
        .limit(50);

    const nearbyCandidates = openIssues
        .map((issue) => {
            const distanceMeters = haversineDistance(coordinates, issue.coordinates);
            const categoryMatch = category && issue.category
                ? String(issue.category).toLowerCase() === String(category).toLowerCase()
                : false;
            const similarity = textOverlapScore(userMessage, `${issue.title} ${issue.userMessage}`);

            return {
                issue,
                distanceMeters,
                categoryMatch,
                similarity,
            };
        })
        .filter(({ distanceMeters, categoryMatch, similarity }) =>
            distanceMeters <= 250 && (categoryMatch || similarity >= 0.3)
        )
        .sort((a, b) => a.distanceMeters - b.distanceMeters);

    const duplicateCandidates = nearbyCandidates.slice(0, 3).map(({ issue }) => issue._id);

    return {
        isLikelyDuplicate: nearbyCandidates.length > 0,
        duplicateOf: nearbyCandidates[0]?.issue?._id || null,
        duplicateCandidates,
        duplicateClusterSize: nearbyCandidates.length,
    };
};

const buildTimelineEntry = ({ status, note = '', actorId = 'system', actorType = 'system' }) => ({
    status,
    note,
    actorId,
    actorType,
    createdAt: new Date(),
});

const calculateAuthenticityMetrics = (issue) => {
    const votes = Array.isArray(issue.authenticityVotes) ? issue.authenticityVotes : [];

    const counts = {
        confirm: 0,
        false: 0,
        duplicate: 0,
    };

    const weights = {
        confirm: 0,
        false: 0,
        duplicate: 0,
    };

    votes.forEach((vote) => {
        const type = vote.voteType || 'confirm';
        const weight = Number(vote.weight || 1);
        if (counts[type] !== undefined) {
            counts[type] += 1;
            weights[type] += weight;
        }
    });

    const totalWeight = weights.confirm + weights.false + weights.duplicate;
    const trustScore = totalWeight > 0
        ? Math.max(0, Math.min(100, Math.round(((weights.confirm - weights.false) / totalWeight) * 100 + 50)))
        : 0;

    let verificationStatus = issue.verificationStatus || 'under review';
    if (issue.municipalDecision === 'approved') verificationStatus = 'approved';
    else if (issue.municipalDecision === 'rejected') verificationStatus = 'rejected';
    else if (issue.municipalDecision === 'duplicate') verificationStatus = 'duplicate';
    else if (weights.confirm >= Math.max(2, weights.false + 1)) verificationStatus = 'community verified';
    else if (weights.false > weights.confirm) verificationStatus = 'flagged';
    else verificationStatus = 'under review';

    return {
        communityConfirmCount: counts.confirm,
        communityFalseCount: counts.false,
        communityDuplicateCount: counts.duplicate,
        trustScore,
        verificationStatus,
        votes: counts.confirm,
        voters: votes.filter((vote) => vote.voteType === 'confirm').map((vote) => vote.userId),
    };
};

const applyAuthenticityMetrics = (issue) => {
    const metrics = calculateAuthenticityMetrics(issue);
    issue.communityConfirmCount = metrics.communityConfirmCount;
    issue.communityFalseCount = metrics.communityFalseCount;
    issue.communityDuplicateCount = metrics.communityDuplicateCount;
    issue.trustScore = metrics.trustScore;
    issue.verificationStatus = metrics.verificationStatus;
    issue.votes = metrics.votes;
    issue.voters = metrics.voters;
    return metrics;
};

// Create a new issue
const createIssue = async (req, res) => {
    try {
        console.log('📝 Create issue request received');
        console.log('Request body:', req.body);
        
        const { userMessage, coordinates, imageUrl, mediaType = 'image' } = req.body;
        const userId = req.auth?.uid || req.body.userId;

        console.log("userId:", userId);
        
        if (!userId) {
            console.log('No user ID found in auth');
            return res.status(401).json({ error: 'Authentication required' });
        }
        
        if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
            console.log('Invalid coordinates:', coordinates);
            return res.status(400).json({ error: 'Valid location is required' });
        }
        
        if(!imageUrl){
            console.log('No media URL provided');
            return res.status(400).json({ error: 'Image or video is required' });
        }
        
        const isVideo = mediaType === 'video';
        const analysis = isVideo
            ? {
                category: inferCategoryFromMessage(userMessage),
                issueType: 'Video report',
                title: deriveTitleFromMessage(userMessage, 'Civic video report'),
                severity: 'Medium',
                urgency: 'Soon',
                suggestedDepartment: 'Municipal Operations Desk',
                publicSummary: 'Citizen submitted a video report for municipal review.',
                authoritySummary: 'Video evidence requires municipal review and classification.',
                recommendedAction: 'Review the video evidence and dispatch the relevant field team.',
                confidence: 0.45,
            }
            : await analyzeImage(imageUrl);
        const { city, state } = await getLocation(coordinates.latitude, coordinates.longitude);
        const category = analysis.category && !['unknown', 'other'].includes(String(analysis.category).toLowerCase())
            ? analysis.category
            : inferCategoryFromMessage(userMessage);
        const title = analysis.title && !['unknown issue', 'unknown', 'other'].includes(String(analysis.title).toLowerCase())
            ? analysis.title
            : deriveTitleFromMessage(userMessage, category);
        const duplicateInfo = await detectDuplicateIssues({ coordinates, category, userMessage });
        const priorityScore = computePriorityScore(analysis, 0, duplicateInfo.duplicateClusterSize);
        console.log('💾 Creating issue in database...');
        const newIssue = await Issue.create({
            userId,
            userMessage: userMessage || '',
            category,
            issueType: analysis.issueType || '',
            title,
            coordinates,
            city: city,
            state: state,
            imageUrl: imageUrl || '',
            mediaType: isVideo ? 'video' : 'image',
            severity: analysis.severity || '',
            urgency: analysis.urgency || '',
            suggestedDepartment: analysis.suggestedDepartment || '',
            publicSummary: analysis.publicSummary || '',
            authoritySummary: analysis.authoritySummary || '',
            recommendedAction: analysis.recommendedAction || '',
            confidence: Number(analysis.confidence || 0),
            priorityScore,
            isLikelyDuplicate: duplicateInfo.isLikelyDuplicate,
            duplicateOf: duplicateInfo.duplicateOf,
            duplicateCandidates: duplicateInfo.duplicateCandidates,
            duplicateClusterSize: duplicateInfo.duplicateClusterSize,
            verificationStatus: 'under review',
            municipalDecision: 'pending',
            statusTimeline: [
                buildTimelineEntry({
                    status: 'open',
                    note: 'Issue created and routed for municipal review',
                    actorId: userId,
                    actorType: 'citizen',
                }),
            ],
        });

        // Log the issue creation
        await logAction({
            userType: 'user',
            userId: userId,
            action: 'Create Issue',
            issueId: newIssue._id,
            details: `New issue "${newIssue.title}" reported in ${city}, ${state}`,
            severity: 'info',
            req
        });

        res.status(201).json(newIssue);
    } catch (error) {
        console.error('Error creating issue:', error.message);
        res.status(500).json({ error: error.message });
    }
}

const getAllIssues = async (req, res) => {
    try {
        const municipalScope = req.profile?.portalType === 'municipality'
            ? buildMunicipalIssueFilter(req.profile)
            : { filter: {}, scope: null };

        if (municipalScope.scope) {
            console.log('Municipal scope filter', JSON.stringify(municipalScope.scope));
        }

        const issues = await Issue.find(municipalScope.filter).sort({ createdAt: -1 });
        if (municipalScope.scope) {
            console.log(`Municipal scoped issue count: ${issues.length}`);
        }
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getUsersIssues = async (req, res) => {
    try {
        const { userId } = req.params;
        const requesterId = req.auth?.uid;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (requesterId && requesterId !== userId && !req.auth?.admin) {
            return res.status(403).json({ error: 'You can only view your own issues' });
        }
        
        const issues = await Issue.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getIssues = async (req, res) => {
    try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      city,
      state,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    // Build dynamic filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
    if (city) filter.city = { $regex: city, $options: "i" }; // case-insensitive
    if (state) filter.state = { $regex: state, $options: "i" };

    // Sorting logic
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortBy]: sortOrder };

    // Pagination
    const skip = (page - 1) * limit;

        const issues = await Issue.find(filter, { __v: 0 })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Issue.countDocuments(filter);

    // structured response
    res.status(200).json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      count: issues.length,
      issues,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const updateIssueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['open', 'in progress', 'pending', 'closed', 'resolved'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }
        
        const previousStatus = issue.status;
        issue.status = status;
        issue.priorityScore = computePriorityScore(issue, issue.votes, issue.duplicateClusterSize, issue.createdAt);
        issue.statusTimeline = [
            ...(issue.statusTimeline || []),
            buildTimelineEntry({
                status,
                note: `Status changed from ${previousStatus} to ${status}`,
                actorId: req.auth?.uid || req.body.userId || 'system',
                actorType: 'municipality',
            }),
        ];
        await issue.save();

        // Log the status update
        await logAction({
            userType: 'admin', // Assume admin is updating status
            userId: req.auth?.uid || req.body.userId || 'system',
            action: 'Update Issue Status',
            issueId: id,
            details: `Issue status changed from "${previousStatus}" to "${status}"`,
            severity: status === 'resolved' ? 'info' : 'warning',
            req
        });

        res.status(200).json(issue);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const assignIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { officerId, dueAt } = req.body;

        if (!officerId) {
            return res.status(400).json({ error: 'Officer ID is required' });
        }

        const [issue, officer] = await Promise.all([
            Issue.findById(id),
            Officer.findById(officerId),
        ]);

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        if (!officer) {
            return res.status(404).json({ error: 'Officer not found' });
        }

        issue.assignedToOfficerId = officer._id;
        issue.assignedToOfficerName = officer.fullName;
        issue.assignedBy = req.auth?.uid || 'system';
        issue.dueAt = dueAt ? new Date(dueAt) : issue.dueAt;
        issue.statusTimeline = [
            ...(issue.statusTimeline || []),
            buildTimelineEntry({
                status: issue.status || 'open',
                note: `Assigned to ${officer.fullName}${dueAt ? ` with due date ${new Date(dueAt).toLocaleDateString('en-IN')}` : ''}`,
                actorId: req.auth?.uid || 'system',
                actorType: 'municipality',
            }),
        ];

        await issue.save();

        await logAction({
            userType: 'admin',
            userId: req.auth?.uid || 'system',
            action: 'Assign Issue',
            issueId: id,
            details: `Issue assigned to ${officer.fullName}`,
            severity: 'info',
            req,
        });

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const escalateIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        issue.escalationLevel = Number(issue.escalationLevel || 0) + 1;
        issue.priorityScore = Math.min(100, Number(issue.priorityScore || 0) + 10);
        issue.statusTimeline = [
            ...(issue.statusTimeline || []),
            buildTimelineEntry({
                status: issue.status || 'open',
                note: `Escalated to level ${issue.escalationLevel}`,
                actorId: req.auth?.uid || 'system',
                actorType: 'municipality',
            }),
        ];

        await issue.save();

        await logAction({
            userType: 'admin',
            userId: req.auth?.uid || 'system',
            action: 'Escalate Issue',
            issueId: id,
            details: `Issue escalated to level ${issue.escalationLevel}`,
            severity: 'warning',
            req,
        });

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const deleteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        // Store issue details before deletion for logging
        const issueTitle = issue.title;
        const issueCity = issue.city;
        
        await Issue.findByIdAndDelete(id);

        // Log the deletion
        await logAction({
            userType: 'admin',
            userId: req.auth?.uid || req.body.userId || 'system',
            action: 'Delete Issue',
            issueId: id,
            details: `Issue "${issueTitle}" deleted from ${issueCity}`,
            severity: 'warning',
            req
        });

        res.status(200).json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const searchIssues = async (req, res) => {
    try {
        const { query } = req.query;
        const issues = await Issue.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { issueType: { $regex: query, $options: 'i' } },
                { city: { $regex: query, $options: 'i' } },
                { state: { $regex: query, $options: 'i' } }
            ]
        });
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
const voteIssue = async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType = 'confirm' } = req.body;
        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        const validVoteTypes = ['confirm', 'false', 'duplicate'];
        if (!validVoteTypes.includes(voteType)) {
            return res.status(400).json({ error: 'Invalid vote type' });
        }

        const userId = req.auth?.uid || req.body.userId;
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required to vote' });
        }

        const profile = await UserProfile.findOne({ firebaseUid: userId }).lean();
        const sameCity = profile?.citizenProfile?.city && issue.city
            ? String(profile.citizenProfile.city).trim().toLowerCase() === String(issue.city).trim().toLowerCase()
            : false;
        const weight = sameCity ? 2 : 1;

        if (!Array.isArray(issue.authenticityVotes)) {
            issue.authenticityVotes = [];
        }

        const existingVoteIndex = issue.authenticityVotes.findIndex((vote) => vote.userId === userId);
        let voteAction;

        if (existingVoteIndex >= 0 && issue.authenticityVotes[existingVoteIndex].voteType === voteType) {
            issue.authenticityVotes.splice(existingVoteIndex, 1);
            voteAction = `removed ${voteType} vote from`;
        } else {
            const payload = {
                userId,
                voteType,
                weight,
                city: profile?.citizenProfile?.city || '',
                locality: profile?.citizenProfile?.locality || '',
                createdAt: new Date(),
            };

            if (existingVoteIndex >= 0) {
                issue.authenticityVotes[existingVoteIndex] = payload;
                voteAction = `changed vote to ${voteType} on`;
            } else {
                issue.authenticityVotes.push(payload);
                voteAction = `cast ${voteType} vote on`;
            }
        }

        const metrics = applyAuthenticityMetrics(issue);
        issue.priorityScore = computePriorityScore(issue, issue.votes, issue.duplicateClusterSize, issue.createdAt);
        await issue.save();

        // Log the vote action
        await logAction({
            userType: 'user',
            userId: userId,
            action: 'Verify Issue Authenticity',
            issueId: id,
            details: `User ${voteAction} issue "${issue.title}" (confirm: ${metrics.communityConfirmCount}, false: ${metrics.communityFalseCount}, duplicate: ${metrics.communityDuplicateCount}, trust: ${metrics.trustScore})`,
            severity: 'info',
            req
        });

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const decideIssueAuthenticity = async (req, res) => {
    try {
        const { id } = req.params;
        const { decision, note = '' } = req.body;
        const validDecisions = ['approved', 'rejected', 'duplicate'];

        if (!validDecisions.includes(decision)) {
            return res.status(400).json({ error: 'Invalid municipal decision' });
        }

        const issue = await Issue.findById(id);
        if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
        }

        issue.municipalDecision = decision;
        issue.decisionNote = String(note || '').trim();

        if (decision === 'rejected' || decision === 'duplicate') {
            issue.status = 'closed';
        } else if (decision === 'approved' && issue.status === 'closed') {
            issue.status = 'open';
        }

        const metrics = applyAuthenticityMetrics(issue);
        issue.statusTimeline = [
            ...(issue.statusTimeline || []),
            buildTimelineEntry({
                status: issue.status || 'open',
                note: `Municipal authenticity decision: ${decision}${issue.decisionNote ? ` - ${issue.decisionNote}` : ''}`,
                actorId: req.auth?.uid || 'system',
                actorType: 'municipality',
            }),
        ];
        issue.priorityScore = computePriorityScore(issue, issue.votes, issue.duplicateClusterSize, issue.createdAt);
        await issue.save();

        await logAction({
            userType: 'admin',
            userId: req.auth?.uid || 'system',
            action: 'Municipal Authenticity Decision',
            issueId: id,
            details: `Issue marked ${decision} by municipality (trust: ${metrics.trustScore})`,
            severity: decision === 'approved' ? 'info' : 'warning',
            req,
        });

        res.status(200).json(issue);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createIssue, getIssues, updateIssueStatus, deleteIssue, getAllIssues, searchIssues, getUsersIssues, voteIssue, assignIssue, escalateIssue, decideIssueAuthenticity };
