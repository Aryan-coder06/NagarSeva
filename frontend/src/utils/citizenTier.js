export const citizenLevels = [
  {
    id: 0,
    level: 'Level 0',
    name: 'Prarambh',
    hindi: 'प्रारम्भ',
    vibe: 'The Newcomer',
    minReports: 0,
    minResolved: 0,
    minValidations: 0,
    minStreak: 0,
    tagClass: 'border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-slate-800 dark:text-zinc-200',
    chipClass: 'border-zinc-300 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-slate-900 dark:text-zinc-200',
    gradient: 'from-zinc-500 via-slate-500 to-zinc-700',
    aura: 'shadow-[0_0_24px_rgba(148,163,184,0.18)]',
    reward: 0,
  },
  {
    id: 1,
    level: 'Level 1',
    name: 'Jagruk',
    hindi: 'जागरूक',
    vibe: 'The Aware Citizen',
    minReports: 1,
    minResolved: 0,
    minValidations: 0,
    minStreak: 0,
    tagClass: 'border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    chipClass: 'border-sky-300 bg-sky-100/80 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    gradient: 'from-sky-500 via-cyan-500 to-emerald-500',
    aura: 'shadow-[0_0_28px_rgba(14,165,233,0.22)]',
    reward: 100,
  },
  {
    id: 2,
    level: 'Level 2',
    name: 'Nagar Sathi',
    hindi: 'नगर साथी',
    vibe: 'The Active Ally',
    minReports: 10,
    minResolved: 1,
    minValidations: 10,
    minStreak: 3,
    tagClass: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    chipClass: 'border-emerald-300 bg-emerald-100/80 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    aura: 'shadow-[0_0_32px_rgba(16,185,129,0.24)]',
    reward: 2000,
  },
  {
    id: 3,
    level: 'Level 3',
    name: 'Prahari',
    hindi: 'प्रहरी',
    vibe: 'The Sentinel',
    minReports: 20,
    minResolved: 5,
    minValidations: 25,
    minStreak: 7,
    tagClass: 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    chipClass: 'border-violet-300 bg-violet-100/80 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    aura: 'shadow-[0_0_36px_rgba(168,85,247,0.28)]',
    reward: 5000,
  },
  {
    id: 4,
    level: 'Level 4',
    name: 'Karmayogi',
    hindi: 'कर्मयोगी',
    vibe: 'The Legendary Builder',
    minReports: 40,
    minResolved: 12,
    minValidations: 75,
    minStreak: 50,
    tagClass: 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200',
    chipClass: 'border-amber-300 bg-amber-100/90 text-amber-800 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-200',
    gradient: 'from-amber-300 via-yellow-400 to-orange-500',
    aura: 'shadow-[0_0_42px_rgba(251,191,36,0.34)]',
    reward: 10000,
  },
];

export const getCitizenLevel = ({
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

  const next = citizenLevels[current.id + 1] || null;
  const progress = next
    ? Math.min(
        100,
        Math.round(
          (
            (reports / next.minReports) * 0.45 +
            (resolved / Math.max(next.minResolved, 1)) * 0.25 +
            (validations / Math.max(next.minValidations, 1)) * 0.15 +
            (streakDays / Math.max(next.minStreak, 1)) * 0.15
          ) * 100
        )
      )
    : 100;

  return {
    ...current,
    next,
    progress,
  };
};
