import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock3,
  CopyCheck,
  MapPin,
  MessageSquareText,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  WifiOff,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { getCategoryConfig, getStatusConfig } from '../../data/demoIssues';

const BASE_API_URL = import.meta.env.VITE_BACKEND_URL;
const statusPriority = { open: 4, pending: 3, 'in progress': 2, resolved: 1, closed: 0 };

export default function VotingSystem() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/api/issues?limit=100&sortBy=createdAt&order=desc`);
        if (!response.ok) throw new Error('Failed to fetch issues');
        const data = await response.json();
        setIssues(Array.isArray(data?.issues) ? data.issues : []);
        setLoadError('');
      } catch (error) {
        console.error('Failed to fetch voting feed:', error);
        setLoadError('Live public voting feed is temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
    const intervalId = setInterval(fetchIssues, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const rankedIssues = useMemo(() => {
    return [...issues]
      .sort((a, b) => {
        const aScore = Number(a.communityConfirmCount || a.votes || 0) * 3 + Number(a.priorityScore || 0);
        const bScore = Number(b.communityConfirmCount || b.votes || 0) * 3 + Number(b.priorityScore || 0);
        if (bScore !== aScore) return bScore - aScore;
        return (statusPriority[String(b.status || '').toLowerCase()] || 0) - (statusPriority[String(a.status || '').toLowerCase()] || 0);
      })
      .slice(0, 18);
  }, [issues]);

  const stats = useMemo(() => ({
    liveIssues: issues.length,
    confirmations: issues.reduce((sum, issue) => sum + Number(issue.communityConfirmCount || issue.votes || 0), 0),
    underReview: issues.filter((issue) => issue.verificationStatus === 'under review').length,
    resolved: issues.filter((issue) => String(issue.status).toLowerCase() === 'resolved').length,
  }), [issues]);

  return (
    <main className="min-h-screen overflow-hidden relative">
      <div className="absolute inset-0 bg-[#070d1a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-25%,rgba(16,185,129,0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_100%,rgba(6,182,212,0.08),transparent_60%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-20">
        {loadError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 mx-auto flex max-w-lg items-center justify-center gap-2 rounded-xl border border-amber-500/20 bg-amber-950/30 backdrop-blur-sm px-4 py-2.5 text-sm text-amber-200"
          >
            <WifiOff className="h-4 w-4 flex-shrink-0" />
            <span>{loadError}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            <Sparkles className="mr-2 h-4 w-4" />
            Public voting feed
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl">
            See what the community is validating right now.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-slate-300">
            This feed surfaces trending civic reports, community authenticity signals, and the AI-generated public summaries powering NagarSeva’s public action layer.
          </p>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Live issues', stats.liveIssues, TrendingUp],
            ['Confirmations', stats.confirmations, ThumbsUp],
            ['Under review', stats.underReview, Clock3],
            ['Resolved', stats.resolved, CheckCircle2],
          ].map(([label, value, Icon], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + index * 0.08, duration: 0.45 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl"
            >
              <Icon className="mb-3 h-5 w-5 text-emerald-400" />
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 grid gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="h-5 w-48 rounded bg-white/10" />
                <div className="mt-4 h-4 w-full rounded bg-white/10" />
                <div className="mt-2 h-4 w-4/5 rounded bg-white/10" />
              </div>
            ))
          ) : rankedIssues.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-8 py-16 text-center text-slate-400">
              <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-slate-500" />
              <p className="text-lg font-semibold text-white">No public voting activity yet</p>
              <p className="mt-2 text-sm">Once issues are reported and validated, this feed will populate automatically.</p>
            </div>
          ) : (
            rankedIssues.map((issue, index) => {
              const status = getStatusConfig(issue.status);
              const category = getCategoryConfig(issue.category);
              const summary = issue.publicSummary || issue.userMessage || 'AI-generated summary will appear once triage completes.';
              return (
                <motion.article
                  key={issue._id || `${issue.title}-${index}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.04, duration: 0.45 }}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${category.badge}`}>{category.label}</span>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                          AI-generated public summary
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white">{issue.title || issue.issueType || 'Civic issue'}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                        <span className="inline-flex items-center"><MapPin className="mr-1.5 h-4 w-4 text-emerald-400" />{issue.city || 'Unknown area'}{issue.state ? `, ${issue.state}` : ''}</span>
                        <span className="inline-flex items-center"><ShieldCheck className="mr-1.5 h-4 w-4 text-cyan-400" />{issue.verificationStatus || 'under review'}</span>
                      </div>
                      <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200">{summary}</p>
                    </div>

                    <div className="grid min-w-[220px] grid-cols-2 gap-3 lg:grid-cols-1">
                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Confirmations</p>
                        <p className="mt-2 text-2xl font-bold text-white">{Number(issue.communityConfirmCount || issue.votes || 0)}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Priority</p>
                        <p className="mt-2 text-2xl font-bold text-white">{Number(issue.priorityScore || 0)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <ThumbsUp className="mr-2 h-4 w-4 text-emerald-400" />
                      {Number(issue.communityConfirmCount || issue.votes || 0)} confirm
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <CopyCheck className="mr-2 h-4 w-4 text-amber-400" />
                      {Number(issue.communityDuplicateCount || 0)} duplicate
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                      <MessageSquareText className="mr-2 h-4 w-4 text-cyan-400" />
                      {issue.authoritySummary || issue.recommendedAction || 'Municipal brief generated'}
                    </span>
                  </div>
                </motion.article>
              );
            })
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/30 via-[#0b1120] to-cyan-950/30 p-7 backdrop-blur-xl sm:flex-row sm:items-center"
        >
          <div>
            <h3 className="text-xl font-bold text-white">Want to see citizen rankings instead?</h3>
            <p className="mt-2 text-sm text-slate-300">Open the live leaderboard built from real resolved issues and validation activity.</p>
          </div>
          <Link
            to="/leaderboard"
            className="inline-flex items-center rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white"
          >
            Open leaderboard
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
