import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, CheckCircle2, Clock3, MapPinned, Shield, Sparkles, ThumbsUp, UserRound, Zap } from 'lucide-react';
import { demoIssues, getStatusConfig } from '../../data/demoIssues';
import heroPothole from '../../assets/hero_pothole.jpg';

const stats = [
  { label: 'Reports triaged', value: '12.8k', icon: Sparkles },
  { label: 'Community checks', value: '41k', icon: ThumbsUp },
  { label: 'Avg. response cut', value: '37%', icon: Clock3 },
  { label: 'Hotspots mapped', value: '286', icon: MapPinned },
];

const features = [
  {
    title: 'Report Issues',
    description: 'Upload evidence, attach GPS, and route the issue into an accountable local action queue.',
  },
  {
    title: 'Track Progress',
    description: 'Follow every issue from report to review to resolution with transparent status changes.',
  },
  {
    title: 'Community Voting',
    description: 'Validate what matters locally so high-impact problems get prioritized first.',
  },
];

const portals = [
  {
    title: 'Citizen Portal',
    description: 'Report issues, validate nearby complaints, and track your own submissions end to end.',
    href: '/citizen/login',
    action: 'Open citizen portal',
    icon: UserRound,
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Municipal Portal',
    description: 'Review priority cases, assign teams, monitor trends, and manage the operational queue.',
    href: '/municipal/login',
    action: 'Open municipal portal',
    icon: Building2,
    tone: 'from-slate-900 to-emerald-900',
  },
];

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Home() {
  const featured = demoIssues[0];

  return (
    <main className="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <section className="border-b border-green-100 bg-white pt-8 dark:border-green-900/20 dark:bg-gray-900 md:pt-12">
        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-12 px-6 lg:grid-cols-[1fr_560px]">
          <div className="flex flex-col items-start gap-6 text-left">
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl leading-tight"
            >
              Report Local Issues.
              <br />
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Make Your City Better.
              </span>
            </motion.h1>

            <p className="max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">
              NagarSeva combines image evidence, map intelligence, community validation, and Gemini-powered civic triage to turn scattered complaints into trackable public action.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/report"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-green-600 hover:to-emerald-700"
              >
                Report an Issue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/community"
                className="inline-flex items-center justify-center rounded-xl border border-green-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-green-50 dark:border-green-800 dark:bg-slate-900 dark:text-white dark:hover:bg-green-950/50"
              >
                Open Issue Map
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl border border-green-100 bg-green-50/50 p-4 dark:border-green-900/20 dark:bg-green-950/20"
                >
                  <item.icon className="mb-3 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-mono text-2xl font-bold text-zinc-950 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="rounded-3xl border border-green-100 bg-white p-3 shadow-2xl dark:border-green-900/20 dark:bg-slate-900"
          >
            <div className="rounded-2xl bg-gradient-to-br from-gray-950 to-green-950 p-4">
              <div className="rounded-2xl bg-white p-4 dark:bg-slate-950">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-950 dark:text-white">Live civic case</p>
                    <p className="text-xs text-zinc-500">AI generated triage preview</p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusConfig(featured.status).badge}`}>
                    {getStatusConfig(featured.status).label}
                  </span>
                </div>
                <img src={heroPothole} alt={featured.title} className="h-64 w-full rounded-xl object-cover" />
                <div className="mt-4">
                  <h2 className="font-heading text-xl font-bold text-zinc-950 dark:text-white">{featured.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{featured.userMessage}</p>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
                    <p className="text-xs font-medium text-red-600">Severity</p>
                    <p className="font-bold text-red-700 dark:text-red-300">{featured.severity}</p>
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
                  <p className="text-xs font-semibold uppercase text-zinc-500">Recommended action</p>
                  <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{featured.recommendedAction}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[28px] p-6 shadow-sm hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
            >
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300 group-hover:scale-110 transition-transform duration-300">
                {feature.title === 'Report Issues' && <Sparkles className="h-5 w-5" />}
                {feature.title === 'Track Progress' && <CheckCircle2 className="h-5 w-5" />}
                {feature.title === 'Community Voting' && <Zap className="h-5 w-5" />}
              </div>
              <h3 className="font-heading text-lg font-bold text-zinc-950 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="border-y border-green-100 bg-white dark:border-green-900/20 dark:bg-slate-900/70">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Two operating portals</p>
            <h2 className="font-heading mt-2 text-3xl font-bold text-zinc-950 dark:text-white">Separate citizen reporting from municipal operations.</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              The product now supports two clear entry points: a citizen-side reporting and verification workflow, and a municipal-side action center for triage, assignment, and oversight.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {portals.map((portal) => (
              <Link
                key={portal.title}
                to={portal.href}
                className="group rounded-3xl border border-green-100 bg-white p-6 shadow-sm hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 dark:border-green-900/20 dark:bg-slate-950"
              >
                <div className={`inline-flex rounded-2xl bg-gradient-to-r ${portal.tone} p-3 text-white shadow-lg`}>
                  <portal.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading mt-5 text-2xl font-bold text-zinc-950 dark:text-white">{portal.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{portal.description}</p>
                <div className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {portal.action}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-green-100 bg-green-50/40 dark:border-green-900/20 dark:bg-green-950/10">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Community pulse</p>
              <h2 className="font-heading mt-2 text-3xl font-bold text-zinc-950 dark:text-white">Issues citizens are validating now</h2>
            </div>
            <Link to="/community" className="inline-flex items-center text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              View all reports
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-4 md:grid-cols-4"
          >
            {demoIssues.slice(0, 4).map((issue) => (
              <motion.div
                key={issue._id}
                variants={fadeUp}
                className="rounded-2xl border border-green-100 bg-white p-4 dark:border-green-900/20 dark:bg-slate-900 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getStatusConfig(issue.status).badge}`}>
                    {getStatusConfig(issue.status).label}
                  </span>
                  <span className="font-mono text-xs font-semibold text-zinc-500">{issue.priorityScore} priority</span>
                </div>
                <h3 className="font-heading mt-4 min-h-12 text-base font-bold text-zinc-950 dark:text-white">{issue.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{issue.city}, {issue.state}</p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center text-zinc-600 dark:text-zinc-300">
                    <ThumbsUp className="mr-1.5 h-4 w-4 text-emerald-600" />
                    <span className="font-mono">{issue.votes}</span>
                  </span>
                  <span className="inline-flex items-center text-zinc-600 dark:text-zinc-300">
                    <Shield className="mr-1.5 h-4 w-4 text-emerald-600" />
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
