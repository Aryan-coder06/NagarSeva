require('dotenv').config();
const mongoose = require('mongoose');
const UserProfile = require('../models/UserProfile');
const Issue = require('../models/Issue');
const { createNotificationForProfile, buildIssueUrl } = require('../services/notifications');
const { getCitizenStats } = require('../services/citizenTier');

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const profiles = await UserProfile.find({ portalType: 'citizen' }).lean();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatDateKey(today);
  let sent = 0;

  for (const profile of profiles) {
    const issues = await Issue.find({ userId: profile.firebaseUid }).select('createdAt').lean();
    const activeDays = new Set(
      issues.map((issue) => {
        const d = new Date(issue.createdAt);
        d.setHours(0, 0, 0, 0);
        return formatDateKey(d);
      })
    );
    const stats = await getCitizenStats(profile.firebaseUid);

    if (stats.streakDays > 0 && !activeDays.has(todayKey)) {
      await createNotificationForProfile({
        profile,
        type: 'streak_reminder',
        title: 'Your civic streak is at risk',
        message: `You are on a ${stats.streakDays}-day reporting streak. Submit or validate one issue today to keep the streak alive and protect your ${stats.level.name} progression.`,
        ctaLabel: 'Open report flow',
        ctaUrl: `${buildIssueUrl(null, 'citizen').replace(/\/dashboard$/, '/report')}`,
        email: {
          subject: 'NagarSeva streak reminder',
          title: 'Keep your civic streak alive',
          message: `You have a ${stats.streakDays}-day civic streak. One report or meaningful validation today can preserve your progress toward ${stats.level.name} and the ₹${stats.level.reward.toLocaleString('en-IN')} cycle reward band.`,
          ctaLabel: 'Report now',
          variant: 'streak_reminder',
        },
      });
      sent += 1;
    }
  }

  console.log(`Streak reminders sent: ${sent}`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
