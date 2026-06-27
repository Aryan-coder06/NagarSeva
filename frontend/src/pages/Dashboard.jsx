import { Link } from 'react-router-dom';
import { getUsersIssues } from '../api/Issues';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Globe2,
  Flame,
  Info,
  Layers3,
  MapPinned,
  Medal,
  PlusCircle,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  ThumbsUp,
  Trophy,
  UserRound,
  WifiOff,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SignedIn, SignedOut, SignInButton } from '../components/AuthComponents';
import IssuePopup from '../components/IssuePopup';
import Loader from '../components/extras/Loader';
import MapUI from '../components/MapUI';
import { demoIssues, getCategoryConfig, getStatusConfig } from '../data/demoIssues';
import { motion } from 'framer-motion';
import ScrollMorphShowcase from '../components/dashboard/ScrollMorphShowcase';
import { getCitizenLevel } from '../utils/citizenTier';
import FireStreak from '../components/dashboard/FireStreak';
import AnimatedCounter from '../components/dashboard/AnimatedCounter';
import CompactHeatmap from '../components/dashboard/CompactHeatmap';
import uploadImage from '../utils/uploadImage';

const ACTIVITY_WINDOW_DAYS = 150;
const GRID_COLUMNS = 15;
const BASE_API_URL = import.meta.env.VITE_BACKEND_URL;

const badgeCatalog = [
  {
    id: 'pulse',
    name: 'Pulse',
    description: 'File your first civic report.',
    icon: Sparkles,
    color: 'from-cyan-500 to-sky-600',
    progress: (stats) => stats.totalReports,
    goal: 1,
  },
  {
    id: 'wardwatch',
    name: 'Wardwatch',
    description: 'Post 10 reports that build a visible public trail.',
    icon: ShieldCheck,
    color: 'from-emerald-500 to-teal-600',
    progress: (stats) => stats.totalReports,
    goal: 10,
  },
  {
    id: 'tenfold',
    name: 'Tenfold',
    description: 'Hit 10 reports in a single week.',
    icon: Zap,
    color: 'from-fuchsia-500 to-violet-600',
    progress: (stats) => stats.bestWeek,
    goal: 10,
  },
  {
    id: 'fixloop',
    name: 'Fixloop',
    description: 'See 5 of your reports resolved by the municipal team.',
    icon: Trophy,
    color: 'from-amber-500 to-orange-600',
    progress: (stats) => stats.resolved,
    goal: 5,
  },
  {
    id: 'civic50',
    name: 'Civic50',
    description: 'Maintain a 50-day reporting streak.',
    icon: Flame,
    color: 'from-rose-500 to-red-600',
    progress: (stats) => stats.streakDays,
    goal: 50,
  },
  {
    id: 'signal',
    name: 'Signal',
    description: 'Cross 50 total community validations on your reports.',
    icon: ThumbsUp,
    color: 'from-indigo-500 to-blue-600',
    progress: (stats) => stats.validations,
    goal: 50,
  },
];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getIssueDate = (issue) => {
  const raw = issue.createdAt || issue.reportedAt || issue.updatedAt;
  const parsed = raw ? new Date(raw) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const getDisplayName = (user) => {
  return user?.name || user?.displayName || user?.email?.split('@')[0] || 'Citizen';
};

const getInitials = (user) => {
  const name = getDisplayName(user).trim();
  const words = name.split(/\s+/).slice(0, 2);
  return words.map((word) => word[0]?.toUpperCase() || '').join('') || 'NS';
};

const getMonthlyActivityCells = (issues) => {
  const counts = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  issues.forEach((issue) => {
    const date = getIssueDate(issue);
    if (!date) return;
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - date) / 86400000);
    if (diffDays < 0 || diffDays >= ACTIVITY_WINDOW_DAYS) return;
    const key = formatDateKey(date);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const cells = [];
  for (let i = ACTIVITY_WINDOW_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const key = formatDateKey(day);
    cells.push({
      key,
      date: new Date(day),
      count: counts.get(key) || 0,
    });
  }

  return cells;
};

const getStreakDays = (cells) => {
  const activeDays = new Set(cells.filter((cell) => cell.count > 0).map((cell) => cell.key));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;

  for (let i = 0; i < ACTIVITY_WINDOW_DAYS; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = formatDateKey(date);
    if (activeDays.has(key)) streak += 1;
    else break;
  }

  return streak;
};

const getBestWeek = (issues) => {
  const counts = new Map();
  issues.forEach((issue) => {
    const date = getIssueDate(issue);
    if (!date) return;
    date.setHours(0, 0, 0, 0);
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    const key = formatDateKey(start);
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return Math.max(0, ...counts.values());
};

const getLocationHeatGrid = (issues) => {
  const geoIssues = issues.filter((issue) => issue.coordinates?.latitude && issue.coordinates?.longitude);
  if (!geoIssues.length) return [];

  const lats = geoIssues.map((issue) => issue.coordinates.latitude);
  const lngs = geoIssues.map((issue) => issue.coordinates.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = Math.max(maxLat - minLat, 0.01);
  const lngSpan = Math.max(maxLng - minLng, 0.01);
  const rows = 4;
  const cols = 6;
  const buckets = Array.from({ length: rows * cols }, (_, index) => ({
    index,
    count: 0,
    sample: null,
  }));

  geoIssues.forEach((issue) => {
    const latRatio = (issue.coordinates.latitude - minLat) / latSpan;
    const lngRatio = (issue.coordinates.longitude - minLng) / lngSpan;
    const row = Math.min(rows - 1, Math.max(0, Math.floor((1 - latRatio) * rows)));
    const col = Math.min(cols - 1, Math.max(0, Math.floor(lngRatio * cols)));
    const bucketIndex = row * cols + col;
    const bucket = buckets[bucketIndex];
    bucket.count += 1;
    bucket.sample ??= issue.city || issue.state || issue.category;
  });

  return buckets;
};

const getPulseMessage = (issues) => {
  const total = issues.length;
  if (total >= 50) return 'India is actively reporting. Local proof is turning civic neglect into visible public pressure.';
  if (total >= 20) return 'The reporting network is warming up. Each new issue strengthens a city-wide signal for faster action.';
  if (total >= 8) return 'The pulse is building. Early reports are already forming visible clusters across Indian cities.';
  return 'Every report adds one more public signal. Start the pulse in your ward and help the network grow.';
};

const getHeatClass = (count, maxCount) => {
  if (!count) return 'bg-zinc-100 dark:bg-slate-800/80';
  const ratio = maxCount ? count / maxCount : 0;
  if (ratio < 0.34) return 'bg-emerald-200 dark:bg-emerald-900/70';
  if (ratio < 0.67) return 'bg-emerald-400 dark:bg-emerald-700/80';
  return 'bg-emerald-600 dark:bg-emerald-500';
};

const Dashboard = () => {
  const [userIssues, setUserIssues] = useState(demoIssues);
  const [globalIssues, setGlobalIssues] = useState(demoIssues);
  const [usingDemo, setUsingDemo] = useState(false);
  const { user, getToken, loading: authLoading, profile, profileLoading, isMunicipal, saveProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showTierModal, setShowTierModal] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const avatarInputRef = useRef(null);

  const fetchUserIssues = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = await getToken();
      const issues = await getUsersIssues(token, user.$id);
      setUserIssues(Array.isArray(issues) ? issues : []);
      setUsingDemo(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setUserIssues([]);
        setUsingDemo(false);
      } else {
        console.warn('Using demo dashboard data while backend data is unavailable.');
        setUserIssues(demoIssues);
        setUsingDemo(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchUserIssues();
  }, [user]);

  useEffect(() => {
    const fetchGlobalIssues = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/api/issues?limit=120&sortBy=createdAt&order=desc`);
        if (!response.ok) throw new Error('Failed to load community pulse');
        const data = await response.json();
        const liveIssues = Array.isArray(data?.issues) ? data.issues : [];
        setGlobalIssues(liveIssues.length ? liveIssues : demoIssues);
      } catch (error) {
        setGlobalIssues(demoIssues);
      }
    };

    fetchGlobalIssues();
    const intervalId = setInterval(fetchGlobalIssues, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const activityCells = useMemo(() => getMonthlyActivityCells(userIssues), [userIssues]);
  const locationHeat = useMemo(() => getLocationHeatGrid(userIssues), [userIssues]);
  const communityPulseCells = useMemo(() => getMonthlyActivityCells(globalIssues).slice(-90), [globalIssues]);
  const communityClusters = useMemo(() => {
    const counts = new Map();
    globalIssues.forEach((issue) => {
      const key = issue.city || 'Unmapped';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [globalIssues]);

  const metrics = useMemo(() => {
    const total = userIssues.length;
    const open = userIssues.filter((issue) => ['open', 'pending'].includes(String(issue.status).toLowerCase())).length;
    const resolved = userIssues.filter((issue) => issue.status === 'resolved').length;
    const validations = userIssues.reduce((sum, issue) => sum + (issue.votes || issue.communityConfirmCount || 0), 0);
    const bestWeek = getBestWeek(userIssues);
    const streakDays = getStreakDays(activityCells);
    const heroScore = validations + resolved * 20 + total * 4 + streakDays;
    return {
      total,
      open,
      resolved,
      validations,
      bestWeek,
      streakDays,
      heroScore,
    };
  }, [activityCells, userIssues]);

  const badgeProgress = useMemo(() => {
    return badgeCatalog.map((badge) => {
      const current = badge.progress({
        totalReports: metrics.total,
        resolved: metrics.resolved,
        validations: metrics.validations,
        streakDays: metrics.streakDays,
        bestWeek: metrics.bestWeek,
      });
      return {
        ...badge,
        current,
        earned: current >= badge.goal,
        percent: Math.min(100, Math.round((current / badge.goal) * 100)),
      };
    });
  }, [metrics]);

  const citizenLevel = useMemo(() => getCitizenLevel({
    reports: metrics.total,
    resolved: metrics.resolved,
    validations: metrics.validations,
    streakDays: metrics.streakDays,
  }), [metrics]);

  const topBadges = badgeProgress.filter((badge) => badge.earned).slice(0, 3);
  const nextBadges = badgeProgress.filter((badge) => !badge.earned).slice(0, 3);
  const maxHeatCount = Math.max(0, ...locationHeat.map((cell) => cell.count));
  const maxActivityCount = Math.max(0, ...activityCells.map((cell) => cell.count));
  const maxCommunityPulse = Math.max(0, ...communityPulseCells.map((cell) => cell.count));
  const monthLabels = useMemo(() => {
    const seen = new Set();
    return activityCells.reduce((labels, cell, index) => {
      const label = cell.date.toLocaleDateString('en-IN', { month: 'short' });
      if (seen.has(label)) return labels;
      seen.add(label);
      labels.push({ label, index });
      return labels;
    }, []);
  }, [activityCells]);

  const localClusters = useMemo(() => {
    const counts = new Map();
    userIssues.forEach((issue) => {
      const key = `${issue.city || 'Unknown'}::${issue.category || 'Other'}`;
      counts.set(key, {
        city: issue.city || 'Unknown',
        category: issue.category || 'Other',
        count: (counts.get(key)?.count || 0) + 1,
      });
    });
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 4);
  }, [userIssues]);

  const communityPulseMessage = useMemo(() => getPulseMessage(globalIssues), [globalIssues]);

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    try {
      setAvatarSaving(true);
      const token = await getToken();
      const upload = await uploadImage(file, token);
      await saveProfile({
        fullName: profile?.fullName || getDisplayName(user),
        email: user?.email,
        phone: profile?.phone || '',
        country: profile?.country || 'India',
        portalType: profile?.portalType || 'citizen',
        citizenProfile: profile?.citizenProfile || {},
        municipalityProfile: profile?.municipalityProfile || {},
        avatarUrl: upload.url,
      });
    } finally {
      setAvatarSaving(false);
      event.target.value = '';
    }
  };

  return (
    <main className="min-h-screen">
      <SignedOut>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <ShieldCheck className="mx-auto mb-5 h-12 w-12 text-emerald-600" />
            <h1 className="font-heading text-3xl font-bold text-zinc-950 dark:text-white">Access your civic dashboard</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">Sign in to report issues, track progress, and build your community contribution profile.</p>
            <div className="mt-6">
              <SignInButton>
                <span className="btn-premium bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                  Sign in
                </span>
              </SignInButton>
            </div>
          </motion.div>
        </div>
      </SignedOut>

      <SignedIn>
        {loading || authLoading || profileLoading ? (
          <div className="grid min-h-[80vh] place-items-center"><Loader /></div>
        ) : isMunicipal() ? (
          <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <ShieldCheck className="mx-auto mb-5 h-12 w-12 text-zinc-500" />
            <h1 className="font-heading text-3xl font-bold text-zinc-950 dark:text-white">This workspace is for citizens</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">
              Your account is registered for the municipal portal{profile?.municipalityProfile?.city ? ` in ${profile.municipalityProfile.city}` : ''}. Use the municipal dashboard for operations work.
            </p>
            <Link to="/admin/dashboard" className="mt-6 inline-flex items-center rounded-xl bg-zinc-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950">
              Open municipal portal
            </Link>
          </div>
        ) : (
          <div className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
                <motion.section
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-[28px] border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                >
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="group relative h-16 w-16 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 text-lg font-black text-white shadow-lg shadow-emerald-500/25"
                    >
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt={getDisplayName(user)} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center">
                          {getInitials(user)}
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-slate-950/60 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Camera className="h-3 w-3" />
                        {avatarSaving ? 'Saving' : 'Update'}
                      </div>
                    </button>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Citizen</p>
                      <h2 className="text-xl font-bold text-zinc-950 dark:text-white">{getDisplayName(user)}</h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {profile?.citizenProfile?.city || 'India'}{profile?.citizenProfile?.state ? `, ${profile.citizenProfile.state}` : ''}
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${citizenLevel.tagClass}`}>
                          {citizenLevel.level}
                        </span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${citizenLevel.chipClass}`}>
                          {citizenLevel.name}
                        </span>
                      </div>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*,.jpeg,.jpg,.png,.webp,.avif"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="relative overflow-hidden rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/90 to-amber-50/70 p-3 dark:border-orange-800/30 dark:from-orange-950/40 dark:to-amber-950/30">
                      <FireStreak streakDays={metrics.streakDays} compact className="absolute -right-1 -top-1 opacity-80" />
                      <div className="relative flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <Flame className="h-4 w-4 animate-fire-flicker" />
                        <span className="text-xs font-semibold uppercase">Streak</span>
                      </div>
                      <p className="relative mt-2 text-2xl font-black text-orange-950 dark:text-white"><AnimatedCounter value={metrics.streakDays} /></p>
                      <p className="relative text-xs text-orange-800/80 dark:text-orange-200/80">active days</p>
                    </div>
                    <div className="rounded-2xl border border-cyan-200/70 bg-cyan-50/80 p-3 dark:border-cyan-900/40 dark:bg-cyan-950/30">
                      <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase">Hero score</span>
                      </div>
                      <p className="mt-2 text-2xl font-black text-cyan-950 dark:text-white"><AnimatedCounter value={metrics.heroScore} duration={1400} /></p>
                      <p className="text-xs text-cyan-800/80 dark:text-cyan-200/80">civic impact</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/20 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Citizen tier</h3>
                      <button
                        type="button"
                        onClick={() => setShowTierModal(true)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-emerald-300/50 bg-emerald-50 text-emerald-700 transition hover:scale-105 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                        aria-label="Open citizen level requirements"
                        title="Open citizen level requirements"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 rounded-2xl border border-white/30 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-900/60">
                      <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white ${citizenLevel.gradient} ${citizenLevel.aura}`}>
                        {citizenLevel.name}
                      </div>
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Month-end cycle reward</p>
                      <p className="mt-1 text-xl font-black text-zinc-950 dark:text-white">₹{citizenLevel.reward.toLocaleString('en-IN')}</p>
                      <p className="mt-1 text-[11px] leading-5 text-zinc-500 dark:text-zinc-400">Government reward for holding this tier through the full monthly cycle.</p>
                      <p className="mt-3 text-sm font-semibold text-zinc-950 dark:text-white">{citizenLevel.hindi}</p>
                      <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{citizenLevel.vibe}</p>
                      {citizenLevel.next && (
                        <>
                          <div className="mt-4 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                            <span>Next: {citizenLevel.next.name}</span>
                            <span>{citizenLevel.progress}%</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-800">
                            <div className={`h-full rounded-full bg-gradient-to-r ${citizenLevel.gradient}`} style={{ width: `${citizenLevel.progress}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                        <span>Best week</span>
                        <span className="font-semibold text-zinc-950 dark:text-white">{metrics.bestWeek} reports</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                        <span>Resolved by city</span>
                        <span className="font-semibold text-zinc-950 dark:text-white">{metrics.resolved}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300">
                        <span>Validation power</span>
                        <span className="font-semibold text-zinc-950 dark:text-white">{metrics.validations}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Badge rack</h3>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">{badgeProgress.filter((badge) => badge.earned).length}/{badgeProgress.length}</span>
                    </div>
                    <div className="space-y-3">
                      {[...topBadges, ...nextBadges].slice(0, 4).map((badge) => {
                        const Icon = badge.icon;
                        return (
                          <div key={badge.id} className="rounded-2xl border border-white/20 bg-white/70 p-3 dark:border-white/10 dark:bg-slate-950/60">
                            <div className="flex items-center gap-3">
                              <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-lg ${badge.earned ? '' : 'opacity-55'}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-sm font-bold text-zinc-950 dark:text-white">{badge.name}</p>
                                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.earned ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-zinc-100 text-zinc-500 dark:bg-slate-800 dark:text-zinc-300'}`}>
                                    {badge.earned ? 'Earned' : `${badge.current}/${badge.goal}`}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{badge.description}</p>
                                {!badge.earned && (
                                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-800">
                                    <div className={`h-full rounded-full bg-gradient-to-r ${badge.color}`} style={{ width: `${badge.percent}%` }} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <Link to="/report" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New report
                    </Link>
                    <Link to="/community" className="inline-flex items-center justify-center rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-slate-900 dark:text-white dark:hover:bg-zinc-800">
                      Open community map
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </motion.section>
              </aside>

              <div>
                <div className="mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-[28px] border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="flex items-start gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Citizen portal</p>
                        <h1 className="mt-1 text-3xl font-bold text-zinc-950 dark:text-white">
                          Welcome back, <span className="gradient-text">{getDisplayName(user)}</span>
                        </h1>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${citizenLevel.tagClass}`}>
                            {citizenLevel.level}
                          </span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${citizenLevel.chipClass}`}>
                            {citizenLevel.name} • {citizenLevel.hindi}
                          </span>
                        </div>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          Track your reports, see community validation, watch location hotspots grow, and follow each issue from AI triage to final closure.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <ScrollMorphShowcase />

                {usingDemo && (
                  <div className="mb-6 mt-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-200">
                    <WifiOff className="h-4 w-4" />
                    Showing demo dashboard until MongoDB is connected.
                  </div>
                )}

                <div className="mb-6 mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {[
                    ['My reports', metrics.total, MapPinned],
                    ['Needs action', metrics.open, Clock3],
                    ['Resolved', metrics.resolved, CheckCircle2],
                    ['Validations', metrics.validations, ThumbsUp],
                  ].map(([label, value, Icon], index) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      whileHover={{ y: -5, scale: 1.03 }}
                      className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-cyan-500/[0.04] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      <motion.div
                        className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 blur-xl"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.5 }}
                      />
                      <div className="relative">
                        <div className="mb-3 inline-flex rounded-xl bg-emerald-50/80 p-2.5 transition-colors duration-300 group-hover:bg-emerald-100 dark:bg-emerald-950/40 dark:group-hover:bg-emerald-900/50">
                          <Icon className="h-5 w-5 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400" />
                        </div>
                        <p className="font-mono text-3xl font-bold text-zinc-950 dark:text-white"><AnimatedCounter value={value} /></p>
                        <p className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mb-6 grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_420px]">
                  <motion.section
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.12 }}
                    className="rounded-[28px] border border-white/20 bg-white/70 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <h2 className="mb-4 flex items-center text-lg font-bold text-zinc-950 dark:text-white">
                      <MapPinned className="mr-2 h-5 w-5 text-emerald-600" />
                      Your issue map
                    </h2>
                    <MapUI issues={userIssues} selectedIssue={selectedIssue} onSelectIssue={setSelectedIssue} openDetailsOnMarkerClick={false} />
                  </motion.section>

                  <div className="space-y-4">
                    <motion.section
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.18 }}
                      className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/20 dark:bg-emerald-950/30"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Community Hero score</p>
                          <p className="mt-2 font-mono text-4xl font-bold text-emerald-950 dark:text-white"><AnimatedCounter value={metrics.heroScore} duration={1600} /></p>
                          <div className="mt-3 inline-flex rounded-full bg-white/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-900 dark:bg-slate-950/50 dark:text-white">
                            {citizenLevel.name}
                          </div>
                        </div>
                        <Sparkles className="h-8 w-8 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-emerald-800 dark:text-emerald-200">Earn points when your reports are validated, resolved, and spread across more active reporting days.</p>
                    </motion.section>

                    <motion.section
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.24 }}
                      className="rounded-[28px] border border-white/20 bg-white/70 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                    >
                      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h2 className="text-base font-bold text-zinc-950 dark:text-white">Recent activity</h2>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Latest issue movement across your queue</p>
                          </div>
                          <CalendarDays className="h-4 w-4 text-emerald-600" />
                        </div>
                      </div>
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {userIssues.slice(0, 5).map((issue, index) => {
                          const status = getStatusConfig(issue.status);
                          return (
                            <motion.button
                              key={issue._id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.35, delay: 0.28 + index * 0.06 }}
                              onClick={() => setSelectedIssue(issue)}
                              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"
                            >
                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-semibold text-zinc-950 dark:text-white">{issue.title}</p>
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{issue.city || 'Mapped issue'}{issue.createdAt ? ` • ${new Date(issue.createdAt).toLocaleDateString('en-IN')}` : ''}</p>
                              </div>
                              <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
                            </motion.button>
                          );
                        })}
                        {userIssues.length === 0 && (
                          <div className="px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400">No reports yet. Create your first report to start tracking civic action.</div>
                        )}
                      </div>
                    </motion.section>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
                  <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.16 }}
                    className="rounded-[28px] border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="flex items-center text-lg font-bold text-zinc-950 dark:text-white">
                          <Layers3 className="mr-2 h-5 w-5 text-emerald-600" />
                          Local hotspot heatmap
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Spatial pressure from your own reports. Darker blocks mean repeat reporting in the same part of the map.</p>
                      </div>
                      <div className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-300">
                        {locationHeat.filter((cell) => cell.count > 0).length} active cells
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {locationHeat.length ? locationHeat.map((cell) => (
                        <div
                          key={cell.index}
                          title={cell.count ? `${cell.sample || 'Reported area'} • ${cell.count} report${cell.count === 1 ? '' : 's'}` : 'No reports in this block'}
                          className={`aspect-square rounded-2xl border border-white/40 shadow-sm transition-transform duration-200 hover:scale-[1.03] dark:border-white/10 ${getHeatClass(cell.count, maxHeatCount)}`}
                        >
                          <div className="flex h-full flex-col justify-between p-2">
                            <span className="text-[11px] font-bold text-zinc-900 dark:text-white">{cell.count || ''}</span>
                            <span className="line-clamp-2 text-[10px] font-medium text-zinc-700/80 dark:text-zinc-100/80">{cell.sample || ''}</span>
                          </div>
                        </div>
                      )) : (
                        <div className="col-span-6 rounded-2xl border border-dashed border-zinc-300 px-4 py-8 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                          Reported issues with coordinates will appear here as a live hotspot heatmap.
                        </div>
                      )}
                    </div>
                    {!!localClusters.length && (
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        {localClusters.map((cluster) => {
                          const category = getCategoryConfig(cluster.category);
                          return (
                            <div key={`${cluster.city}-${cluster.category}`} className="rounded-2xl border border-white/20 bg-zinc-50/80 p-3 dark:border-white/10 dark:bg-slate-950/60">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-sm font-bold text-zinc-950 dark:text-white">{cluster.city}</p>
                                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{cluster.category}</p>
                                </div>
                                <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${category.badge}`}>{cluster.count}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.section>

                  <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.22 }}
                    className="rounded-[28px] border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="flex items-center text-lg font-bold text-zinc-950 dark:text-white">
                          <Globe2 className="mr-2 h-5 w-5 text-emerald-600" />
                          Community Pulse
                        </h2>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Live reporting growth across Indian cities over the last 90 days.</p>
                      </div>
                      <div className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-300">
                        Last 90 days
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-700 dark:bg-slate-950/60">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Sparkles className="h-4 w-4" />
                          <p className="text-sm font-bold text-zinc-950 dark:text-white">Live growth</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{communityPulseMessage}</p>
                        <div className="mt-4 space-y-2">
                          {communityClusters.map((cluster) => (
                            <div key={cluster.city} className="flex items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-sm dark:bg-slate-900/70">
                              <span className="font-medium text-zinc-800 dark:text-zinc-100">{cluster.city}</span>
                              <span className="rounded-full border border-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:text-emerald-300">
                                {cluster.count}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="mb-3 flex items-center justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                          <span>Less</span>
                          <div className="flex flex-wrap justify-end gap-2">
                            {[...new Set(communityPulseCells.map((cell) => cell.date.toLocaleDateString('en-IN', { month: 'short' })))].map((month) => (
                              <span key={month}>{month}</span>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(18, minmax(0, 1fr))' }}>
                          {communityPulseCells.map((cell) => (
                            <div
                              key={cell.key}
                              title={`${cell.date.toLocaleDateString('en-IN')}${cell.count ? ` • ${cell.count} reports` : ' • no reports'}`}
                              className={`aspect-square rounded-[10px] border border-white/30 transition-transform duration-150 hover:scale-105 dark:border-white/10 ${getHeatClass(cell.count, maxCommunityPulse)}`}
                            />
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                          <span>India-wide pulse</span>
                          <div className="flex items-center gap-1">
                            {[0, 1, 2, 3, 4].map((index) => (
                              <span
                                key={index}
                                className={`h-3 w-3 rounded-[4px] border border-white/20 ${getHeatClass(index === 0 ? 0 : Math.ceil((maxCommunityPulse || 1) * (index / 4)), maxCommunityPulse || 1)}`}
                              />
                            ))}
                          </div>
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  </motion.section>
                </div>

                <motion.section
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.28 }}
                  className="mt-6 rounded-[28px] border border-white/20 bg-white/70 p-5 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="flex items-center text-lg font-bold text-zinc-950 dark:text-white">
                        <Medal className="mr-2 h-5 w-5 text-emerald-600" />
                        Tier ladder
                      </h2>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Gamified milestones tied to daily streaks, weekly reporting bursts, validation power, and municipal resolutions.</p>
                    </div>
                    <div className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-300">
                      {badgeProgress.filter((badge) => badge.earned).length} unlocked
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                    {badgeProgress.map((badge) => {
                      const Icon = badge.icon;
                      return (
                        <div key={badge.id} className="rounded-[24px] border border-white/20 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-slate-950/60">
                          <div className="flex items-start gap-4">
                            <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-lg ${badge.earned ? '' : 'opacity-60 grayscale-[0.1]'}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-base font-bold text-zinc-950 dark:text-white">{badge.name}</p>
                                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{badge.description}</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${badge.earned ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-zinc-200 text-zinc-600 dark:bg-slate-800 dark:text-zinc-300'}`}>
                                  {badge.earned ? 'Unlocked' : 'Locked'}
                                </span>
                              </div>
                              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                <span>{badge.current}/{badge.goal}</span>
                                <span>{badge.percent}%</span>
                              </div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-slate-800">
                                <div className={`h-full rounded-full bg-gradient-to-r ${badge.color}`} style={{ width: `${badge.percent}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.section>
              </div>
            </div>
          </div>
        )}

        {showTierModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md" onClick={() => setShowTierModal(false)}>
            <div
              className="w-full max-w-3xl rounded-[30px] border border-white/10 bg-white/95 p-6 shadow-2xl dark:bg-slate-950/95"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Citizen level system</p>
                  <h2 className="mt-1 text-2xl font-bold text-zinc-950 dark:text-white">Progression ladder</h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Leveling is tied to valid reporting, municipal resolutions, community validation, and consistent streaks.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTierModal(false)}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                >
                  Close
                </button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  {
                      level: 'Level 1',
                      name: 'Jagruk',
                      hindi: 'जागरूक',
                      requirement: '1-5 valid reports submitted',
                      vibe: 'The Aware Citizen',
                      style: 'from-sky-500 via-cyan-500 to-emerald-500',
                      reward: 100,
                    },
                    {
                      level: 'Level 2',
                      name: 'Nagar Sathi',
                      hindi: 'नगर साथी',
                      requirement: '10+ reports, validation activity, and 1+ resolved issue',
                      vibe: 'The Active Ally',
                      style: 'from-emerald-500 via-teal-500 to-cyan-600',
                      reward: 2000,
                    },
                    {
                      level: 'Level 3',
                      name: 'Prahari',
                      hindi: 'प्रहरी',
                      requirement: '20+ reports, 5+ resolved issues, and stronger trust signal',
                      vibe: 'The Sentinel',
                      style: 'from-violet-500 via-fuchsia-500 to-pink-500',
                      reward: 5000,
                    },
                    {
                      level: 'Level 4',
                      name: 'Karmayogi',
                      hindi: 'कर्मयोगी',
                      requirement: '40+ reports, 12+ resolutions, 75+ validations, and a 50-day streak',
                      vibe: 'The Legendary Builder',
                      style: 'from-amber-300 via-yellow-400 to-orange-500',
                      reward: 10000,
                    },
                ].map((tier) => (
                  <div key={tier.level} className="rounded-[24px] border border-white/20 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-slate-900/70">
                    <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white ${tier.style}`}>
                      {tier.level}
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-zinc-950 dark:text-white">{tier.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">{tier.hindi}</p>
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{tier.vibe}</p>
                    <p className="mt-3 text-xl font-black text-zinc-950 dark:text-white">₹{tier.reward.toLocaleString('en-IN')}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">Government cycle reward</p>
                    <p className="mt-3 rounded-2xl border border-zinc-200 bg-white/80 px-3 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-slate-950/70 dark:text-zinc-200">
                      {tier.requirement}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedIssue && <IssuePopup issue={selectedIssue} setShowIssuePopup={() => setSelectedIssue(null)} />}
      </SignedIn>
    </main>
  );
};

export default Dashboard;
