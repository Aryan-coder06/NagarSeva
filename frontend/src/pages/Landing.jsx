import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Brain,
  Building2,
  CheckCircle2,
  Clock3,
  MapPinned,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import { demoIssues, getStatusConfig } from '../../data/demoIssues';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stats = [
  { label: 'Reports triaged', value: '12.8k', icon: Radar },
  { label: 'Community checks', value: '41k', icon: ThumbsUp },
  { label: 'Avg. response cut', value: '37%', icon: Clock3 },
  { label: 'Hotspots mapped', value: '286', icon: MapPinned },
];

const agentSteps = [
  {
    title: 'Understands evidence',
    text: 'Gemini reads the citizen message and image to detect category, severity, risk, and urgency.',
    icon: Brain,
  },
  {
    title: 'Prioritizes action',
    text: 'NagarSeva combines AI severity, votes, age, and status into a transparent civic priority score.',
    icon: BarChart3,
  },
  {
    title: 'Coordinates response',
    text: 'Admins get department suggestions, resolution steps, and authority-ready summaries.',
    icon: Route,
  },
];

export default function Landing() {
  const featured = demoIssues[0];

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-slate-950 dark:text-zinc-100">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-green-100 bg-white dark:border-green-900/20 dark:bg-slate-950">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/20 blur-3xl dark:from-emerald-900/20 dark:to-teal-900/10" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-cyan-200/30 to-emerald-200/20 blur-3xl dark:from-cyan-900/15 dark:to-emerald-900/10" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_520px] lg:px-8">
          <motion.div
            className="max-w-3xl"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="mb-5 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="mr-2 h-4 w-4" />
              Google Gemini powered civic triage
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-heading max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl"
            >
              Turn local problems into{' '}
              <span className="gradient-text">verified civic action.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              NagarSeva helps citizens report issues with photos and location, then uses AI to classify, prioritize, verify, and track every case through resolution.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/report"
                className="btn-premium inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
              >
                Report an issue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/community"
                className="btn-premium inline-flex items-center justify-center border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                Open community map
              </Link>
            </motion.div>

            <motion.div variants={stagger} className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((item, i) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="group rounded-2xl border border-green-100 bg-white/70 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-green-900/20 dark:bg-slate-900/70"
                >
                  <item.icon className="mb-3 h-5 w-5 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400" />
                  <p className="font-mono text-2xl font-bold text-zinc-950 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Live Civic Case Preview Card */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-green-100 bg-white p-3 shadow-2xl shadow-green-500/10 dark:border-green-900/20 dark:bg-slate-900"
          >
            <div className="rounded-2xl bg-gradient-to-br from-gray-950 to-green-950 p-4">
              <div className="rounded-2xl bg-white p-4 dark:bg-slate-950">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-heading text-sm font-semibold text-zinc-950 dark:text-white">Live civic case</p>
                    <p className="text-xs text-zinc-500">AI generated triage preview</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusConfig(featured.status).badge}`}>
                    {getStatusConfig(featured.status).label}
                  </span>
                </div>
                <img src={featured.imageUrl} alt="" className="h-56 w-full rounded-xl object-cover" />
                <div className="mt-4">
                  <h2 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">{featured.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{featured.userMessage}</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
                    <p className="text-xs font-medium text-red-600">Severity</p>
                    <p className="font-mono font-bold text-red-700 dark:text-red-300">{featured.severity}</p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20">
                    <p className="text-xs font-medium text-amber-600">Priority</p>
                    <p className="font-mono font-bold text-amber-700 dark:text-amber-300">{featured.priorityScore}</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/20">
                    <p className="text-xs font-medium text-emerald-600">Votes</p>
                    <p className="font-mono font-bold text-emerald-700 dark:text-emerald-300">{featured.votes}</p>
                  </div>
                </div>
                <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <p className="font-mono text-xs font-semibold uppercase text-zinc-500">Recommended action</p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{featured.recommendedAction}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── AGENT STEPS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          {agentSteps.map((step) => (
            <motion.div
              key={step.title}
              variants={fadeUp}
              className="group rounded-[28px] border border-green-100 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:border-green-900/20 dark:bg-slate-900/70"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition-transform duration-300 group-hover:scale-110 dark:bg-emerald-950/40 dark:text-emerald-300">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{step.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ─── COMMUNITY PULSE ─── */}
      <section className="border-t border-green-100 bg-white dark:border-green-900/20 dark:bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <motion.div
            className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Community pulse</p>
              <h2 className="font-heading mt-2 text-3xl font-bold text-zinc-950 dark:text-white">Issues citizens are validating now</h2>
            </div>
            <Link to="/community" className="inline-flex items-center text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800 dark:text-emerald-300">
              View all reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            {demoIssues.map((issue) => (
              <motion.div
                key={issue._id}
                variants={fadeUp}
                className="group rounded-2xl border border-green-100 bg-white/70 p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-green-900/20 dark:bg-slate-900/70"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getStatusConfig(issue.status).badge}`}>
                    {getStatusConfig(issue.status).label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">{issue.priorityScore} priority</span>
                </div>
                <h3 className="font-heading mt-4 min-h-12 text-base font-bold text-zinc-950 dark:text-white">{issue.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{issue.city}, {issue.state}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center text-zinc-600 dark:text-zinc-300">
                    <ThumbsUp className="mr-1.5 h-4 w-4 text-emerald-600" />
                    <span className="font-mono">{issue.votes}</span>
                  </span>
                  <span className="inline-flex items-center text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                    {issue.suggestedDepartment}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
