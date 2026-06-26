import { Link } from 'react-router-dom';
import { getUsersIssues } from '../api/Issues';
import { useEffect, useMemo, useState } from 'react';
import { Award, CheckCircle2, Clock3, MapPinned, PlusCircle, ShieldCheck, Sparkles, ThumbsUp, UserRound, WifiOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SignedIn, SignedOut, SignInButton } from '../components/AuthComponents';
import IssuePopup from '../components/IssuePopup';
import Loader from '../components/extras/Loader';
import MapUI from '../components/MapUI';
import { demoIssues, getStatusConfig } from '../data/demoIssues';
import { motion } from 'framer-motion';
import ScrollMorphShowcase from '../components/dashboard/ScrollMorphShowcase';

const Dashboard = () => {
  const [userIssues, setUserIssues] = useState(demoIssues);
  const [usingDemo, setUsingDemo] = useState(false);
  const { user, getToken, loading: authLoading, profile, profileLoading, isMunicipal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);

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

  const metrics = useMemo(() => ({
    total: userIssues.length,
    open: userIssues.filter((issue) => ['open', 'pending'].includes(issue.status)).length,
    resolved: userIssues.filter((issue) => issue.status === 'resolved').length,
    validations: userIssues.reduce((sum, issue) => sum + (issue.votes || 0), 0),
  }), [userIssues]);

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
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6">
              {/* Welcome Header Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-xl p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Citizen portal</p>
                    <h1 className="font-heading mt-1 text-3xl font-bold text-zinc-950 dark:text-white">Welcome back, <span className="gradient-text">{user?.name || user?.email}</span></h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      Track your reports, see community validation, and follow each issue from AI triage to resolution.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <ScrollMorphShowcase />

            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
              <div />
              <Link to="/report" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:from-green-600 hover:to-emerald-700">
                <PlusCircle className="mr-2 h-4 w-4" />
                New report
              </Link>
            </div>

            {usingDemo && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/30 dark:text-amber-200">
                <WifiOff className="h-4 w-4" />
                Showing demo dashboard until MongoDB is connected.
              </div>
            )}

            {/* Metrics Grid */}
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
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
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                >
                  <Icon className="mb-3 h-5 w-5 text-emerald-600" />
                  <p className="font-mono text-3xl font-bold text-zinc-950 dark:text-white">{value}</p>
                  <p className="mt-1 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
              {/* Map Section */}
              <motion.section
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] p-4 shadow-xl"
              >
                <h2 className="mb-4 flex items-center text-lg font-bold text-zinc-950 dark:text-white">
                  <MapPinned className="mr-2 h-5 w-5 text-emerald-600" />
                  Your issue map
                </h2>
                <MapUI issues={userIssues} selectedIssue={selectedIssue} onSelectIssue={setSelectedIssue} />
              </motion.section>

              <aside className="space-y-4">
                {/* Community Hero Score Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/20 dark:bg-emerald-950/30 animate-glow-pulse"
                >
                  <Award className="mb-3 h-6 w-6 text-emerald-700" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading text-sm font-semibold text-emerald-900 dark:text-emerald-200">Community Hero score</p>
                      <p className="font-mono mt-2 text-4xl font-bold text-emerald-950 dark:text-white">{metrics.validations + metrics.resolved * 20}</p>
                    </div>
                    <Sparkles className="h-8 w-8 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-emerald-800 dark:text-emerald-200">Earn points when your reports are validated or resolved.</p>
                </motion.div>

                {/* Recent Activity List */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] shadow-xl"
                >
                  <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                    <h2 className="text-base font-bold text-zinc-950 dark:text-white">Recent activity</h2>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {userIssues.slice(0, 5).map((issue, index) => {
                      const status = getStatusConfig(issue.status);
                      return (
                        <motion.button
                          key={issue._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.55 + index * 0.08 }}
                          onClick={() => setSelectedIssue(issue)}
                          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors duration-200 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20"
                        >
                          <div>
                            <p className="text-sm font-semibold text-zinc-950 dark:text-white">{issue.title}</p>
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{issue.city || 'Mapped issue'}</p>
                          </div>
                          <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
                        </motion.button>
                      );
                    })}
                    {userIssues.length === 0 && (
                      <div className="px-4 py-8 text-sm text-zinc-500 dark:text-zinc-400">No reports yet. Create your first report to start tracking civic action.</div>
                    )}
                  </div>
                </motion.div>

                <Link to="/community" className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-slate-900 dark:text-white dark:hover:bg-zinc-800">
                  Open community map
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </aside>
            </div>
          </div>
        )}

        {selectedIssue && <IssuePopup issue={selectedIssue} setShowIssuePopup={() => setSelectedIssue(null)} />}
      </SignedIn>
    </main>
  );
};

export default Dashboard;
