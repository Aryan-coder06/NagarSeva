const Issue = require('../models/Issue');

const citizenLevels = [
  { id: 0, level: 'Level 0', name: 'Prarambh', hindi: 'प्रारम्भ', vibe: 'The Newcomer', minReports: 0, minResolved: 0, minValidations: 0, minStreak: 0, reward: 0 },
  { id: 1, level: 'Level 1', name: 'Jagruk', hindi: 'जागरूक', vibe: 'The Aware Citizen', minReports: 1, minResolved: 0, minValidations: 0, minStreak: 0, reward: 100 },
  { id: 2, level: 'Level 2', name: 'Nagar Sathi', hindi: 'नगर साथी', vibe: 'The Active Ally', minReports: 10, minResolved: 1, minValidations: 10, minStreak: 3, reward: 2000 },
  { id: 3, level: 'Level 3', name: 'Prahari', hindi: 'प्रहरी', vibe: 'The Sentinel', minReports: 20, minResolved: 5, minValidations: 25, minStreak: 7, reward: 5000 },
  { id: 4, level: 'Level 4', name: 'Karmayogi', hindi: 'कर्मयोगी', vibe: 'The Legendary Builder', minReports: 40, minResolved: 12, minValidations: 75, minStreak: 50, reward: 10000 },
];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStreakDaysFromIssues = (issues = []) => {
  const activeDays = new Set(
    issues
      .map((issue) => new Date(issue.createdAt))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => {
        date.setHours(0, 0, 0, 0);
        return formatDateKey(date);
      })
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  for (let i = 0; i < 365; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = formatDateKey(date);
    if (!activeDays.has(key)) break;
    streak += 1;
  }
  return streak;
};

const computeLevel = ({
  reports = 0,
  resolved = 0,
  validations = 0,
  streakDays = 0,
} = {}) => {
  let current = citizenLevels[0];
  for (const candidate of citizenLevels) {
    if (
      reports >= candidate.minReports &&
      resolved >= candidate.minResolved &&
      validations >= candidate.minValidations &&
      streakDays >= candidate.minStreak
    ) {
      current = candidate;
    }
  }
  return current;
};

const getCitizenStats = async (userId) => {
  const issues = await Issue.find({ userId }).lean();
  const reports = issues.length;
  const resolved = issues.filter((issue) => issue.status === 'resolved').length;
  const validations = issues.reduce((sum, issue) => sum + (issue.votes || issue.communityConfirmCount || 0), 0);
  const streakDays = getStreakDaysFromIssues(issues);
  return {
    reports,
    resolved,
    validations,
    streakDays,
    level: computeLevel({ reports, resolved, validations, streakDays }),
  };
};

module.exports = {
  citizenLevels,
  computeLevel,
  getCitizenStats,
};
