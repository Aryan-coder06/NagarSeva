import { motion } from 'framer-motion';

const Loader = ({ size = 'md', text }) => {
  const sizes = {
    sm: { ring: 'w-8 h-8', dot: 'w-1.5 h-1.5' },
    md: { ring: 'w-12 h-12', dot: 'w-2 h-2' },
    lg: { ring: 'w-16 h-16', dot: 'w-2.5 h-2.5' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`relative ${s.ring}`}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-200/30 dark:border-emerald-800/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner spinning ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 border-r-emerald-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center dot */}
        <motion.div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${s.dot} rounded-full bg-gradient-to-r from-emerald-500 to-teal-500`}
          animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      {text && (
        <motion.p
          className="text-sm font-medium text-zinc-500 dark:text-zinc-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export default Loader;
