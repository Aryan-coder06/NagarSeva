import { useMemo, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ArrowUpRight, MapPinned, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { demoIssues, getStatusConfig } from '../../data/demoIssues';

const spotlightIssues = demoIssues.slice(0, 4).map((issue, index) => ({
  ...issue,
  index,
  message:
    index === 0
      ? 'Road safety starts with visibility. Citizen evidence, AI triage, and community validation help move a dangerous spot out of the backlog.'
      : index === 1
        ? 'Sanitation issues spread fast when they stay invisible. Local photos and precise locality details make them harder to ignore.'
        : index === 2
          ? 'Lighting failures become safety failures after dark. The platform keeps a verifiable history from first report to closure.'
          : 'Water and drainage complaints need regional context. Repeated reports across wards become a pattern, not just a one-off complaint.',
}));

const stats = [
  { label: 'India-first local context', value: 'Ward, city, and locality aware', icon: MapPinned },
  { label: 'Citizen verification loop', value: 'Votes, signals, and resolution trail', icon: Users },
  { label: 'Municipal action layer', value: 'AI triage to accountable action', icon: ShieldCheck },
];

export default function ScrollMorphShowcase() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const nextIndex = Math.min(
      spotlightIssues.length - 1,
      Math.max(0, Math.round(value * (spotlightIssues.length - 1)))
    );
    setActiveIndex(nextIndex);
  });

  const activeIssue = useMemo(() => spotlightIssues[activeIndex] || spotlightIssues[0], [activeIndex]);
  const progressHeight = `${((activeIndex + 1) / spotlightIssues.length) * 100}%`;

  return (
    <section ref={sectionRef} className="relative mb-8 rounded-[32px] border border-white/20 bg-white/70 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 lg:p-6">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">We can come together to solve this</p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-zinc-950 dark:text-white">
            Scroll through real civic pain points and see how one report becomes public action.
          </h2>
          <p className="mt-3 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
            This citizen dashboard is not just a list of tickets. It is a visual operating layer for residents, volunteers, and municipal teams working on the same city.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-3 dark:border-zinc-800 dark:bg-slate-950/70">
              <stat.icon className="h-4 w-4 text-emerald-600" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <div className="relative rounded-[28px] border border-zinc-200 bg-zinc-50/80 px-4 py-6 dark:border-zinc-800 dark:bg-slate-950/60 lg:px-6">
          <div className="pointer-events-none absolute bottom-6 left-6 top-6 w-px bg-zinc-200 dark:bg-zinc-800" />
          <motion.div
            className="absolute left-[23px] top-6 w-[6px] rounded-full bg-gradient-to-b from-emerald-500 via-teal-500 to-cyan-500"
            animate={{ height: progressHeight }}
            transition={{ type: 'spring', stiffness: 120, damping: 26 }}
          />

          <div className="space-y-6">
            {spotlightIssues.map((issue, index) => {
              const active = index === activeIndex;
              const status = getStatusConfig(issue.status);

              return (
                <motion.article
                  key={issue._id}
                  initial={{ opacity: 0.7, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.45 }}
                  className={`ml-5 rounded-[28px] border px-5 py-5 transition-all duration-500 ${
                    active
                      ? 'border-emerald-300 bg-white shadow-lg dark:border-emerald-700/50 dark:bg-slate-900'
                      : 'border-zinc-200 bg-white/70 dark:border-zinc-800 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}>
                      {status.label}
                    </span>
                    <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                      {issue.category}
                    </span>
                    <span className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                      {issue.city}, {issue.state}
                    </span>
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-heading text-2xl font-bold text-zinc-950 dark:text-white">{issue.title}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300">{issue.message}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-slate-950/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Severity</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.severity}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-slate-950/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Priority</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.priorityScore}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-slate-950/70">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">Community support</p>
                      <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{issue.votes} validations</p>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:h-fit">
          <div className="overflow-hidden rounded-[30px] border border-zinc-200 bg-zinc-950 shadow-2xl dark:border-zinc-800">
            <div className="relative aspect-[4/5]">
              {spotlightIssues.map((issue, index) => {
                const active = index === activeIndex;
                return (
                  <motion.img
                    key={issue._id}
                    src={issue.imageUrl}
                    alt={issue.title}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={false}
                    animate={{
                      opacity: active ? 1 : 0,
                      scale: active ? 1 : 1.08,
                      filter: active ? 'blur(0px)' : 'blur(10px)',
                    }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  />
                );
              })}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em]">Active spotlight</span>
                  </div>
                  <h3 className="font-heading mt-3 text-2xl font-bold text-white">{activeIssue.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-200">{activeIssue.userMessage}</p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-100">
                    <span className="font-semibold text-white">Recommended action:</span> {activeIssue.recommendedAction}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
