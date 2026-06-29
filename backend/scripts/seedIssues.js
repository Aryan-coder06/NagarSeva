require('dotenv').config();
const mongoose = require('mongoose');
const Issue = require('../models/Issue');

const daysAgo = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const seededCitizens = {
  prahari: {
    userId: 'citizen-prahari-001',
    reporterName: 'Arya Mehta',
    reporterAvatarUrl: '',
    city: 'Gurugram',
    state: 'Haryana',
    baseCoordinates: { latitude: 28.4595, longitude: 77.0266 },
  },
  sathi: {
    userId: 'citizen-sathi-002',
    reporterName: 'Kabir Jain',
    reporterAvatarUrl: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    baseCoordinates: { latitude: 12.9716, longitude: 77.5946 },
  },
  jagruk: {
    userId: 'citizen-jagruk-003',
    reporterName: 'Meera Singh',
    reporterAvatarUrl: '',
    city: 'Pune',
    state: 'Maharashtra',
    baseCoordinates: { latitude: 18.5204, longitude: 73.8567 },
  },
};

const categoryCatalog = [
  {
    category: 'Roads & Transport',
    issueType: 'Pothole',
    severity: 'High',
    urgency: 'Urgent',
    suggestedDepartment: 'Road Maintenance',
    titlePrefix: 'Critical pothole cluster',
    publicSummary: 'Road surface damage is affecting lane safety and commuter flow.',
    authoritySummary: 'Road maintenance intervention is needed due to repeated citizen reports and mobility risk.',
    recommendedAction: 'Inspect the affected stretch, barricade if required, and schedule asphalt repair.',
    imageUrl: 'https://images.unsplash.com/photo-1572856524070-86308995e4e9?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Garbage & Sanitation',
    issueType: 'Waste overflow',
    severity: 'Medium',
    urgency: 'Soon',
    suggestedDepartment: 'Sanitation',
    titlePrefix: 'Garbage overflow near lane',
    publicSummary: 'Waste buildup is reducing walkability and creating hygiene issues.',
    authoritySummary: 'Collection frequency and area cleanliness need municipal follow-up.',
    recommendedAction: 'Dispatch sanitation crew and review collection timing for the locality.',
    imageUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Street Lighting',
    issueType: 'Streetlight outage',
    severity: 'High',
    urgency: 'Urgent',
    suggestedDepartment: 'Electrical Maintenance',
    titlePrefix: 'Streetlight outage at block',
    publicSummary: 'Dark public stretches are reducing visibility and affecting pedestrian safety.',
    authoritySummary: 'Electrical maintenance team needs to restore illumination in a validated area.',
    recommendedAction: 'Inspect lamp and feeder line, then confirm restoration after dark.',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80',
  },
  {
    category: 'Water Supply & Drainage',
    issueType: 'Drainage overflow',
    severity: 'High',
    urgency: 'Immediate',
    suggestedDepartment: 'Drainage & Sewer Operations',
    titlePrefix: 'Drainage overflow near market',
    publicSummary: 'Overflowing drainage is causing public hygiene risk and affecting local commerce.',
    authoritySummary: 'Drainage overflow requires urgent inspection, cleaning, and sanitation measures.',
    recommendedAction: 'Deploy drainage crew, clear blockage, and sanitize the affected stretch.',
    imageUrl: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
  },
];

const buildIssue = ({
  citizen,
  catalog,
  index,
  createdAt,
  status,
  votes,
  priorityScore,
  locality,
  latOffset = 0,
  lngOffset = 0,
}) => {
  const messageSuffix = status === 'resolved'
    ? 'Residents confirmed the issue was fixed after municipal action.'
    : status === 'in progress'
      ? 'Municipal action has started but commuters are still affected.'
      : 'Residents continue to report the issue as visible on the ground.';

  const timeline = [
    {
      status: 'open',
      note: 'Issue created and added to the civic queue',
      actorId: citizen.userId,
      actorType: 'citizen',
      createdAt,
    },
  ];

  if (status === 'pending') {
    timeline.push({
      status: 'pending',
      note: 'Municipal review initiated',
      actorId: 'municipal-seed',
      actorType: 'municipality',
      createdAt: new Date(createdAt.getTime() + 4 * 60 * 60 * 1000),
    });
  }

  if (status === 'in progress' || status === 'resolved') {
    timeline.push({
      status: 'in progress',
      note: 'Field team assigned for local inspection',
      actorId: 'municipal-seed',
      actorType: 'municipality',
      createdAt: new Date(createdAt.getTime() + 6 * 60 * 60 * 1000),
    });
  }

  if (status === 'resolved') {
    timeline.push({
      status: 'resolved',
      note: 'Repair completed and citizens marked the area improved',
      actorId: 'municipal-seed',
      actorType: 'municipality',
      createdAt: new Date(createdAt.getTime() + 28 * 60 * 60 * 1000),
    });
  }

  return {
    userId: citizen.userId,
    reporterName: citizen.reporterName,
    reporterAvatarUrl: citizen.reporterAvatarUrl,
    title: `${catalog.titlePrefix} ${index + 1} - ${locality}`,
    userMessage: `${catalog.issueType} reported in ${locality}. ${messageSuffix}`,
    status,
    category: catalog.category,
    city: citizen.city,
    state: citizen.state,
    votes,
    coordinates: {
      latitude: Number((citizen.baseCoordinates.latitude + latOffset).toFixed(6)),
      longitude: Number((citizen.baseCoordinates.longitude + lngOffset).toFixed(6)),
    },
    imageUrl: catalog.imageUrl,
    mediaType: 'image',
    issueType: catalog.issueType,
    severity: catalog.severity,
    urgency: catalog.urgency,
    suggestedDepartment: catalog.suggestedDepartment,
    publicSummary: `${catalog.publicSummary} Locality: ${locality}.`,
    authoritySummary: `${catalog.authoritySummary} Locality: ${locality}.`,
    recommendedAction: catalog.recommendedAction,
    confidence: 0.84 + (index % 5) * 0.02,
    priorityScore,
    verificationStatus: status === 'resolved' ? 'approved' : votes >= 30 ? 'community verified' : 'under review',
    municipalDecision: status === 'resolved' || status === 'in progress' ? 'approved' : 'pending',
    communityConfirmCount: Math.round(votes * 0.7),
    communityFalseCount: votes > 10 ? Math.round(votes * 0.06) : 0,
    communityDuplicateCount: votes > 8 ? Math.round(votes * 0.08) : 0,
    trustScore: Math.min(100, 32 + votes),
    escalationLevel: status === 'open' && priorityScore >= 88 ? 1 : 0,
    assignedToOfficerName: status === 'open' ? '' : status === 'resolved' ? 'Priya Nair' : 'Rohan Verma',
    createdAt,
    statusTimeline: timeline,
  };
};

const localities = {
  Gurugram: [
    'Sector 45',
    'Sector 46',
    'Sector 47',
    'Sector 56',
    'Sector 57',
    'Sector 60',
    'Sector 61',
    'Sector 62',
    'Sector 63',
    'Sector 64',
    'Sector 65',
    'Sector 67',
    'Sector 69',
    'Sector 70',
    'Sector 71',
    'Sohna Road',
    'Golf Course Extension',
    'DLF Phase 3',
    'Palam Vihar',
    'New Colony',
    'South City 2',
    'Udyog Vihar',
  ],
  Bengaluru: [
    'Koramangala 5th Block',
    'HSR Layout',
    'Indiranagar',
    'Whitefield',
    'Electronic City',
    'Jayanagar',
    'Banashankari',
    'Malleshwaram',
    'Marathahalli',
    'Bellandur',
    'JP Nagar',
    'Yelahanka',
  ],
  Pune: [
    'Kothrud',
    'Baner',
    'Viman Nagar',
    'Hadapsar',
    'Aundh',
    'Kharadi',
  ],
};

const seedIssues = [];

localities.Gurugram.forEach((locality, index) => {
  const catalog = categoryCatalog[index % categoryCatalog.length];
  const status = index < 6 ? 'resolved' : index < 12 ? 'in progress' : index < 16 ? 'pending' : 'open';
  seedIssues.push(
    buildIssue({
      citizen: seededCitizens.prahari,
      catalog,
      index,
      locality,
      createdAt: daysAgo(88 - index * 4, 9 + (index % 4)),
      status,
      votes: 24 + (index % 5) * 8,
      priorityScore: 74 + (index % 6) * 4,
      latOffset: index * 0.0024,
      lngOffset: index * 0.0018,
    })
  );
});

localities.Bengaluru.forEach((locality, index) => {
  const catalog = categoryCatalog[(index + 1) % categoryCatalog.length];
  const status = index < 2 ? 'resolved' : index < 6 ? 'in progress' : index < 9 ? 'pending' : 'open';
  seedIssues.push(
    buildIssue({
      citizen: seededCitizens.sathi,
      catalog,
      index,
      locality,
      createdAt: daysAgo(76 - index * 5, 10 + (index % 3)),
      status,
      votes: 11 + (index % 4) * 5,
      priorityScore: 62 + (index % 5) * 5,
      latOffset: index * 0.0018,
      lngOffset: index * 0.0014,
    })
  );
});

localities.Pune.forEach((locality, index) => {
  const catalog = categoryCatalog[(index + 2) % categoryCatalog.length];
  const status = index === 0 ? 'resolved' : index < 3 ? 'pending' : 'open';
  seedIssues.push(
    buildIssue({
      citizen: seededCitizens.jagruk,
      catalog,
      index,
      locality,
      createdAt: daysAgo(42 - index * 6, 11),
      status,
      votes: 4 + (index % 3) * 3,
      priorityScore: 50 + (index % 4) * 6,
      latOffset: index * 0.0012,
      lngOffset: index * 0.0012,
    })
  );
});

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in backend/.env');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  let inserted = 0;
  let updated = 0;

  for (const issue of seedIssues) {
    const identity = { title: issue.title, city: issue.city, state: issue.state };
    const existing = await Issue.findOne(identity);

    if (existing) {
      await Issue.updateOne(identity, { $set: issue });
      updated += 1;
    } else {
      await Issue.create(issue);
      inserted += 1;
    }
  }

  console.log(JSON.stringify({
    inserted,
    updated,
    totalSeedRecords: seedIssues.length,
    seededUsers: Object.values(seededCitizens).map((citizen) => citizen.reporterName),
  }, null, 2));
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
