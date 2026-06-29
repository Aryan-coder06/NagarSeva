const Notification = require('../models/Notification');
const UserProfile = require('../models/UserProfile');
const { sendNotificationEmail } = require('./mailer');
const { getCitizenStats } = require('./citizenTier');

const buildIssueUrl = (issueId, portalType = 'citizen') => {
  const frontendBase = (process.env.FRONTEND_APP_URL || '').replace(/\/$/, '');
  if (!frontendBase) return '';

  if (portalType === 'municipality') {
    return `${frontendBase}/admin/issues`;
  }

  return issueId ? `${frontendBase}/dashboard` : `${frontendBase}/dashboard`;
};

const shouldSendEmail = (profile, override = null) => {
  if (typeof override === 'boolean') return override;
  return profile?.notificationPreferences?.email !== false;
};

const shouldCreateInApp = (profile, override = null) => {
  if (typeof override === 'boolean') return override;
  return profile?.notificationPreferences?.inApp !== false;
};

const createNotificationForProfile = async ({
  profile,
  type,
  title,
  message,
  issue = null,
  portalType = profile?.portalType || 'citizen',
  ctaLabel = '',
  ctaUrl = '',
  metadata = {},
  email = {},
  sendEmailOverride = null,
  createInAppOverride = null,
}) => {
  if (!profile?.firebaseUid) return null;

  let notification = null;
  const createInApp = shouldCreateInApp(profile, createInAppOverride);
  const sendEmailEnabled = shouldSendEmail(profile, sendEmailOverride);

  if (createInApp) {
    notification = await Notification.create({
      recipientUserId: profile.firebaseUid,
      recipientEmail: profile.email || '',
      recipientName: profile.fullName || '',
      portalType,
      type,
      title,
      message,
      ctaLabel,
      ctaUrl,
      issueId: issue?._id || null,
      metadata,
      emailStatus: sendEmailEnabled ? 'queued' : 'skipped',
    });
  }

  if (sendEmailEnabled && profile.email) {
    try {
      await sendNotificationEmail({
        to: profile.email,
        recipientName: profile.fullName,
        subject: email.subject || title,
        title: email.title || title,
        message: email.message || message,
        issueTitle: issue?.title || '',
        issueLocation: [issue?.city, issue?.state].filter(Boolean).join(', '),
        ctaUrl: ctaUrl || buildIssueUrl(issue?._id, portalType),
        ctaLabel: ctaLabel || email.ctaLabel || 'Open NagarSeva',
        variant: email.variant || type,
      });

      if (notification) {
        notification.emailSentAt = new Date();
        notification.emailStatus = 'sent';
        await notification.save();
      }
    } catch (error) {
      console.error('Notification email failed:', error.message);
      if (notification) {
        notification.emailStatus = 'failed';
        await notification.save();
      }
    }
  }

  return notification;
};

const createNotificationsForMunicipalScope = async ({
  city = '',
  state = '',
  category = '',
  title,
  message,
  issue,
  metadata = {},
}) => {
  const filter = {
    portalType: 'municipality',
  };

  if (state) {
    filter['municipalityProfile.state'] = { $regex: `^${state}$`, $options: 'i' };
  }

  if (city) {
    filter['municipalityProfile.city'] = { $regex: `^${city}$`, $options: 'i' };
  }

  const municipalProfiles = await UserProfile.find(filter).lean();
  const matchingProfiles = municipalProfiles.filter((profile) => {
    const assigned = profile?.municipalityProfile?.assignedCategories || [];
    if (!category) return true;
    if (!assigned.length) return true;
    return assigned.some((item) => String(item).toLowerCase() === String(category).toLowerCase());
  });

  await Promise.all(
    matchingProfiles.map((profile) =>
      createNotificationForProfile({
        profile,
        portalType: 'municipality',
        type: 'municipal_issue_routed',
        title,
        message,
        issue,
        ctaLabel: 'Open scoped queue',
        ctaUrl: buildIssueUrl(issue?._id, 'municipality'),
        metadata,
        email: {
          subject: `NagarSeva municipal alert: ${issue?.title || 'New routed issue'}`,
          title,
          message,
          ctaLabel: 'Review scoped queue',
        },
      })
    )
  );
};

const maybeSendCitizenLevelUpgrade = async (userId, previousLevelId = 0) => {
  if (!userId) return null;
  const [profile, stats] = await Promise.all([
    UserProfile.findOne({ firebaseUid: userId }).lean(),
    getCitizenStats(userId),
  ]);

  if (!profile || profile.portalType !== 'citizen') return null;
  if (stats.level.id <= previousLevelId) return null;

  await createNotificationForProfile({
    profile,
    type: 'level_up',
    title: `You reached ${stats.level.name}`,
    message: `You unlocked ${stats.level.level} - ${stats.level.name}. Hold this tier through the monthly cycle to stay eligible for the ₹${stats.level.reward.toLocaleString('en-IN')} reward band.`,
    ctaLabel: 'Open dashboard',
    ctaUrl: buildIssueUrl(null, 'citizen'),
    metadata: {
      levelId: stats.level.id,
      levelName: stats.level.name,
      reward: stats.level.reward,
    },
    email: {
      subject: `NagarSeva level up: ${stats.level.name}`,
      title: `${stats.level.level} unlocked: ${stats.level.name}`,
      message: `Your civic activity now places you in ${stats.level.name} (${stats.level.hindi}). Reward band: ₹${stats.level.reward.toLocaleString('en-IN')} for the month-end cycle if you hold the tier. Reports: ${stats.reports}, resolved: ${stats.resolved}, validations: ${stats.validations}, streak: ${stats.streakDays} days.`,
      ctaLabel: 'See progress',
      variant: 'level_up',
    },
  });

  return stats.level;
};

module.exports = {
  createNotificationForProfile,
  createNotificationsForMunicipalScope,
  buildIssueUrl,
  maybeSendCitizenLevelUpgrade,
};
