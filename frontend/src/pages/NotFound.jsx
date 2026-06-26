import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, MapPinned, Search } from 'lucide-react';

const floatVariant = (delay) => ({
  animate: {
    y: [0, -12, 0],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay },
  },
});

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-20">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-200/30 to-cyan-200/20 blur-3xl dark:from-emerald-900/15 dark:to-cyan-900/10" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-teal-200/25 to-emerald-200/15 blur-3xl dark:from-teal-900/10 dark:to-emerald-900/10" />

      <div className="relative z-10 mx-auto max-w-lg text-center">
        {/* Animated 404 number */}
        <motion.div
          className="relative mb-8 select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="font-heading text-[10rem] font-bold leading-none tracking-tighter sm:text-[12rem]">
            <span className="gradient-text">4</span>
            <motion.span
              className="relative inline-block"
              {...floatVariant(0)}
            >
              <span className="gradient-text">0</span>
              {/* Decorative floating icons */}
              <motion.div
                className="absolute -right-6 -top-4"
                {...floatVariant(0.5)}
              >
                <MapPinned className="h-6 w-6 text-emerald-400/60" />
              </motion.div>
              <motion.div
                className="absolute -left-8 bottom-4"
                {...floatVariant(1)}
              >
                <Search className="h-5 w-5 text-teal-400/50" />
              </motion.div>
            </motion.span>
            <span className="gradient-text">4</span>
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="font-heading text-3xl font-bold text-zinc-950 dark:text-white sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-4 text-base leading-7 text-zinc-600 dark:text-zinc-300">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/"
            className="btn-premium inline-flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-premium inline-flex items-center justify-center border border-zinc-300 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-slate-900 dark:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </button>
        </motion.div>

        {/* Decorative dotted line */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-emerald-300 dark:bg-emerald-700"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </motion.div>
      </div>
    </main>
  );
}
