import { motion } from 'framer-motion';

const GRID_COLUMNS = 15;

const getCellColor = (count, maxCount) => {
  if (!count) return 'bg-zinc-100 dark:bg-slate-800/60';
  const ratio = maxCount ? count / maxCount : 0;
  if (ratio < 0.34) return 'bg-emerald-200 dark:bg-emerald-900/50';
  if (ratio < 0.67) return 'bg-emerald-400 dark:bg-emerald-700/60';
  return 'bg-emerald-600 dark:bg-emerald-500';
};

const CompactHeatmap = ({ cells = [], maxCount = 0, className = '' }) => {
  const monthLabels = (() => {
    const seen = new Set();
    return cells.reduce((labels, cell, index) => {
      const label = cell.date.toLocaleDateString('en-IN', { month: 'short' });
      if (seen.has(label)) return labels;
      seen.add(label);
      labels.push({ label, index });
      return labels;
    }, []);
  })();

  return (
    <div className={className}>
      {/* Month labels */}
      <div className="mb-2 flex flex-wrap gap-3">
        {monthLabels.map((month) => (
          <span
            key={`${month.label}-${month.index}`}
            className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500"
          >
            {month.label}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0, 1fr))` }}
      >
        {cells.map((cell, index) => (
          <motion.div
            key={cell.key}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.25,
              delay: Math.min(index * 0.008, 1.2),
              ease: 'easeOut',
            }}
            title={`${cell.date.toLocaleDateString('en-IN')}${cell.count ? ` • ${cell.count} report${cell.count === 1 ? '' : 's'}` : ' • no reports'}`}
            className={`h-[10px] w-[10px] rounded-sm transition-all duration-200 hover:scale-150 hover:ring-2 hover:ring-emerald-400/50 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-offset-slate-900 ${getCellColor(cell.count, maxCount)}`}
          />
        ))}
      </div>
    </div>
  );
};

export default CompactHeatmap;
