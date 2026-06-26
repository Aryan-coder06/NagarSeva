import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getAllIssues } from '../api/Issues';
import Loader from '../components/extras/Loader';
import IssueChart from '../components/admin/IssueChart';
import { Activity, BarChart3, Brain, Building2, ClipboardList, ShieldCheck, Users, WifiOff } from 'lucide-react';
import ManageIssues from './ManageIssues';
import ManageOfficers from './ManageOfficers';
import Logs from './Logs';
import { demoIssues } from '../data/demoIssues';

const buildScopeSummary = (profile) => {
  const municipal = profile?.municipalityProfile || {};
  const regions = [
    municipal.city,
    municipal.zone ? `Zone ${municipal.zone}` : '',
    municipal.ward ? `Ward ${municipal.ward}` : '',
    municipal.locality,
  ].filter(Boolean);

  const categories = municipal.assignedCategories?.length
    ? municipal.assignedCategories.join(', ')
    : 'all assigned categories';

  return {
    regions: regions.join(' • '),
    categories,
  };
};

const tabs = [
  { id: 'dashboard', label: 'Command Center', icon: BarChart3 },
  { id: 'issues', label: 'Manage Issues', icon: ClipboardList },
  { id: 'officers', label: 'Officers', icon: Users },
  { id: 'logs', label: 'Activity Logs', icon: Activity },
];

/* ── animation helpers ─────────────────────────────────── */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeSlideUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const AdminPanel = () => {
  const { isAdmin, isMunicipal, loading, profileLoading, getToken, profile } = useAuth();
  const isAdminUser = isAdmin() || isMunicipal();
  const scope = useMemo(() => buildScopeSummary(profile), [profile]);
  const [issues, setIssues] = useState(demoIssues);
  const [usingDemo, setUsingDemo] = useState(false);
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  /* ── sliding indicator state ───────────────────────── */
  const tabRefs = useRef({});
  const navRef = useRef(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    const nav = navRef.current;
    if (el && nav) {
      const navRect = nav.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setIndicator({
        left: elRect.left - navRect.left,
        width: elRect.width,
      });
    }
  }, [activeTab]);

  const fetchIssues = async () => {
    try {
      setLoadingIssues(true);
      const token = await getToken();
      const data = await getAllIssues(token);
      setIssues(Array.isArray(data) ? data : demoIssues);
      setUsingDemo(false);
    } catch (error) {
      setIssues(demoIssues);
      setUsingDemo(true);
    } finally {
      setLoadingIssues(false);
    }
  };

  useEffect(() => {
    if (isAdminUser) fetchIssues();
  }, [isAdminUser]);

  const metrics = useMemo(() => ({
    total: issues.length,
    highPriority: issues.filter((issue) => (issue.priorityScore || 0) >= 80).length,
    open: issues.filter((issue) => ['open', 'pending'].includes(issue.status)).length,
    resolved: issues.filter((issue) => issue.status === 'resolved').length,
  }), [issues]);

  if (loading || profileLoading) return <div className="grid h-[90vh] place-items-center"><Loader /></div>;

  /* ── access denied ─────────────────────────────────── */
  if (!isAdminUser) {
    return (
      <main className="grid min-h-[80vh] place-items-center bg-zinc-50 px-4 dark:bg-slate-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-md rounded-2xl border border-white/20 bg-white/70 p-8 text-center shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70"
        >
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-zinc-400" />
          <h1 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">Admin access required</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Use a municipal profile or an admin Firebase custom claim to access the operations workspace.</p>
        </motion.div>
      </main>
    );
  }

  /* ── main panel ────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50/20 via-white to-emerald-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-green-950/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── Header Cards (staggered entrance) ──── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mb-6"
        >
          <motion.div
            variants={fadeSlideUp}
            className="rounded-[28px] border border-green-100 bg-white/85 p-5 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80"
          >
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Municipal operations</p>
                <h1 className="font-heading mt-1 text-3xl font-bold text-zinc-950 dark:text-white">AI Civic Action Center</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  Prioritize high-risk issues, coordinate officers, audit activity, and track resolution impact from one workspace.
                  {profile?.municipalityProfile?.city ? ` You are currently scoped to ${profile.municipalityProfile.city}` : ''}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  {scope.regions && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
                      Jurisdiction: {scope.regions}
                    </span>
                  )}
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-700 dark:bg-slate-950 dark:text-zinc-200">
                    Categories: {scope.categories}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Demo-data banner ───────────────────── */}
        {usingDemo && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-200">
            <WifiOff className="h-4 w-4" />
            Demo data active
          </div>
        )}

        {/* ── Metrics Grid (staggered) ───────────── */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Total reports', metrics.total, BarChart3],
            ['High priority', metrics.highPriority, Brain],
            ['Needs action', metrics.open, ClipboardList],
            ['Resolved', metrics.resolved, ShieldCheck],
          ].map(([label, value, Icon], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: 'easeOut' }}
              className="rounded-2xl border border-green-100 bg-white/85 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-green-900/20 dark:bg-slate-900/80"
            >
              <Icon className="mb-3 h-5 w-5 text-emerald-600" />
              <p className="font-mono text-3xl font-bold text-zinc-950 dark:text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* ── Tab Navigation with sliding indicator ─ */}
        <div className="relative mb-6 overflow-x-auto rounded-[24px] border border-green-100 bg-white/85 p-1 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
          <nav ref={navRef} className="relative flex min-w-max gap-1">
            {/* animated background pill */}
            <motion.div
              className="pointer-events-none absolute inset-y-0 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md"
              animate={{ left: indicator.left, width: indicator.width }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              style={{ top: 0, bottom: 0 }}
            />

            {tabs.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <tab.icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── Tab Content (crossfade) ────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {loadingIssues ? (
                <div className="grid h-64 place-items-center"><Loader /></div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-[28px] border border-green-100 bg-white/85 p-5 shadow-xl shadow-green-500/5 backdrop-blur-xl dark:border-green-900/20 dark:bg-slate-900/80">
                    <div className="mb-5">
                      <h2 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">Impact analytics</h2>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">Category, status, and reporting trends only for your assigned municipal scope.</p>
                    </div>
                    <IssueChart issues={issues} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'issues' && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ManageIssues />
            </motion.div>
          )}

          {activeTab === 'officers' && (
            <motion.div
              key="officers"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <ManageOfficers />
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Logs />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default AdminPanel;
