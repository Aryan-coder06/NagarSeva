import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Crown,
  Heart,
  Sparkles,
  ThumbsUp,
  Timer,
  Trophy,
  TrendingUp,
  Users,
  WifiOff,
  Zap,
} from 'lucide-react';
import { getCitizenLevel } from '../../utils/citizenTier';
const BASE_API_URL = import.meta.env.VITE_BACKEND_URL;

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
const toCitizenLabel = (userId = '', index = 0) => {
  const compact = String(userId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase();
  return compact ? `Citizen ${compact}` : `Citizen ${index + 1}`;
};

const toReporterLabel = (issue, index = 0) => {
  const explicit = issue?.reporterName || issue?.userName || issue?.fullName;
  if (explicit && String(explicit).trim()) return String(explicit).trim();
  return toCitizenLabel(issue?.userId, index);
};

const sum = (values) => values.reduce((t, v) => t + v, 0);

const avatarGradients = [
  ['#10b981', '#06b6d4'],
  ['#8b5cf6', '#d946ef'],
  ['#f59e0b', '#ef4444'],
  ['#ec4899', '#f43f5e'],
  ['#3b82f6', '#6366f1'],
  ['#14b8a6', '#10b981'],
  ['#eab308', '#f59e0b'],
  ['#0ea5e9', '#3b82f6'],
  ['#f472b6', '#e11d48'],
  ['#818cf8', '#a855f7'],
];

const getInitials = (label) => {
  const parts = label.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return label.slice(0, 2).toUpperCase();
};

const getReward = (rank) => {
  if (rank === 1) return 500;
  if (rank === 2) return 300;
  if (rank === 3) return 150;
  if (rank <= 5) return 100;
  return 50;
};

const getHeatmapCellClass = (count, max) => {
  if (count === 0) return 'bg-slate-800/60';
  const ratio = count / Math.max(max, 1);
  if (ratio < 0.25) return 'bg-emerald-900/50';
  if (ratio < 0.5) return 'bg-emerald-700/60';
  if (ratio < 0.75) return 'bg-emerald-500';
  return 'bg-emerald-400';
};

const getCellEmoji = (count, max) => {
  if (count === 0) return '';
  const ratio = count / Math.max(max, 1);
  if (ratio < 0.25) return '🌱';
  if (ratio < 0.5) return '🌿';
  if (ratio < 0.75) return '🌳';
  return '🏆';
};

const getCellMessage = (count, max) => {
  if (count === 0) return 'Rest day — recharge for tomorrow 💤';
  const ratio = count / Math.max(max, 1);
  if (ratio < 0.25) return `${count} seed${count > 1 ? 's' : ''} planted 🌱 Every report grows a safer city`;
  if (ratio < 0.5) return `${count} issue${count > 1 ? 's' : ''} addressed 🌿 Streets getting cleaner, lives getting better`;
  if (ratio < 0.75) return `${count} civic action${count > 1 ? 's' : ''} 🌳 Your ward is thriving because of you`;
  return `${count} reports 🏆 A hero day — real change happened here`;
};

const civicSlogans = [
  { emoji: '🌍', text: 'Every report plants a seed of change in your city' },
  { emoji: '🛡️', text: 'Safe streets start with citizens who speak up' },
  { emoji: '🌱', text: 'One report today, a greener ward tomorrow' },
  { emoji: '💚', text: 'Clean air, safe roads, lit streets — built by citizens like you' },
  { emoji: '🤝', text: 'When neighbours report together, municipalities listen faster' },
  { emoji: '🏙️', text: 'The city you want to live in starts with the issue you report' },
  { emoji: '🔥', text: 'Streak days = safer days. Keep the flame alive' },
  { emoji: '🌳', text: 'More reports = more eyes on the ground = safer communities' },
];

const getTierMetrics = (citizen) => ({
  reports: citizen.postedCount || 0,
  resolved: citizen.resolvedCount || 0,
  validations: citizen.totalVotesReceived || 0,
  streakDays: citizen.streakDays || 0,
});

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */

/* Live countdown to end of month */
const useCountdown = () => {
  const getTimeLeft = useCallback(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const diff = Math.max(0, end - now);
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, []);
  const [t, setT] = useState(getTimeLeft);
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, [getTimeLeft]);
  return t;
};

/* Mouse-relative position for 3D tilt (returns -0.5 … 0.5) */
const useTilt3D = (ref) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 20 });

  const onMove = useCallback(
    (e) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      x.set((e.clientX - rect.left) / rect.width - 0.5);
      y.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [ref, x, y]
  );

  const onLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return { rotateX, rotateY, onMove, onLeave };
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Floating Particles Background ── */
const ParticleField = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.4 + 0.1,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0 ? '#10b981' : p.id % 3 === 1 ? '#06b6d4' : '#8b5cf6',
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -80, -160],
            x: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40],
            opacity: [p.opacity, p.opacity * 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

/* ── Sparkle burst around an element ── */
const SparkleRing = ({ count = 8, radius = 60, color = '#fbbf24' }) => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 360;
      return (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full"
          style={{
            left: '50%',
            top: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
          animate={{
            x: [0, Math.cos((angle * Math.PI) / 180) * radius],
            y: [0, Math.sin((angle * Math.PI) / 180) * radius],
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            repeat: Infinity,
            repeatDelay: 4,
            ease: 'easeOut',
          }}
        />
      );
    })}
  </div>
);

/* ── Animated number with spring physics ── */
const AnimatedNumber = ({ value, className }) => {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const dur = 1400;
    const start = performance.now();
    const from = displayed;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setDisplayed(Math.round(from + (value - from) * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <span className={className}>{displayed.toLocaleString()}</span>;
};

/* ── Countdown flip unit ── */
const CountdownUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="relative w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 overflow-hidden"
      style={{ perspective: '200px' }}>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={value}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {String(value).padStart(2, '0')}
          </span>
        </motion.div>
      </AnimatePresence>
      {/* Center divider line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />
    </div>
    <span className="text-[10px] text-slate-500 mt-1.5 uppercase tracking-[0.15em]">{label}</span>
  </div>
);

/* ── 3D Podium Pedestal ── */
const PodiumPedestal = ({ rank, height }) => {
  const colors = {
    1: { face: 'from-yellow-500/30 to-amber-600/20', side: 'from-yellow-600/20 to-amber-700/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_40px_rgba(234,179,8,0.15)]' },
    2: { face: 'from-slate-400/20 to-slate-500/15', side: 'from-slate-500/15 to-slate-600/10', border: 'border-slate-400/15', glow: 'shadow-[0_0_30px_rgba(148,163,184,0.1)]' },
    3: { face: 'from-amber-600/25 to-amber-700/15', side: 'from-amber-700/15 to-amber-800/10', border: 'border-amber-600/15', glow: 'shadow-[0_0_30px_rgba(217,119,6,0.1)]' },
  };
  const c = colors[rank];
  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ delay: 0.8 + rank * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto"
      style={{ transformOrigin: 'bottom center', height, width: rank === 1 ? 180 : 150 }}
    >
      {/* Front face */}
      <div className={`absolute inset-0 rounded-t-2xl bg-gradient-to-b ${c.face} border ${c.border} backdrop-blur-sm ${c.glow}`}
        style={{ transform: 'perspective(400px) rotateX(2deg)', transformOrigin: 'bottom center' }}
      >
        {/* Rank number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-black text-white/[0.06]">{rank}</span>
        </div>
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 rounded-t-2xl"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['-100% 0%', '200% 0%'] }}
          transition={{ duration: 3, delay: 1.5 + rank * 0.3, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
};

/* ── 3D Podium Avatar Card ── */
const PodiumCard = ({ citizen, rank, index }) => {
  const cardRef = useRef(null);
  const { rotateX, rotateY, onMove, onLeave } = useTilt3D(cardRef);
  const isFirst = rank === 1;
  const grad = avatarGradients[index % avatarGradients.length];
  const tier = getCitizenLevel(getTierMetrics(citizen));

  const ringStyle = {
    1: 'ring-[3px] ring-yellow-400/70 shadow-[0_0_30px_rgba(250,204,21,0.35)]',
    2: 'ring-[2px] ring-slate-300/50 shadow-[0_0_20px_rgba(148,163,184,0.2)]',
    3: 'ring-[2px] ring-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
      initial={{ opacity: 0, y: 50, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: rank === 1 ? 0.3 : rank === 2 ? 0.5 : 0.6, duration: 0.8, type: 'spring', stiffness: 100 }}
      className="flex flex-col items-center cursor-default relative group"
    >
      {/* Crown for #1 */}
      {isFirst && (
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
          className="mb-1 relative"
        >
          <motion.div
            animate={{ 
              filter: ['drop-shadow(0 0 8px rgba(250,204,21,0.4))', 'drop-shadow(0 0 16px rgba(250,204,21,0.7))', 'drop-shadow(0 0 8px rgba(250,204,21,0.4))']
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Crown className="h-9 w-9 text-yellow-400" />
          </motion.div>
          <SparkleRing count={6} radius={24} color="#fbbf24" />
        </motion.div>
      )}

      {/* Avatar */}
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`relative rounded-full overflow-hidden ${isFirst ? 'w-28 h-28' : 'w-[88px] h-[88px]'} ${ringStyle[rank]} ${tier.aura}`}
          style={{ transform: 'translateZ(20px)' }}
        >
          {citizen.avatarUrl ? (
            <img src={citizen.avatarUrl} alt={citizen.label} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
            >
              <span className={`font-bold text-white ${isFirst ? 'text-3xl' : 'text-xl'}`} style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {getInitials(citizen.label)}
              </span>
            </div>
          )}

          {/* Gloss overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 rounded-full" />
        </motion.div>

        {/* Rank badge — floats in 3D space */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: rank === 1 ? 0.9 : 1, type: 'spring', stiffness: 300 }}
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 rounded-full flex items-center justify-center
            ${rank === 1 ? 'w-9 h-9 bg-gradient-to-br from-yellow-300 to-amber-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
              : rank === 2 ? 'w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
                : 'w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-700 shadow-[0_4px_12px_rgba(0,0,0,0.3)]'}`}
          style={{ transform: 'translateZ(30px)' }}
        >
          <span className={`font-extrabold ${rank === 1 ? 'text-sm text-amber-900' : 'text-xs text-white'}`}>{rank}</span>
        </motion.div>

        {/* Hovering glow pulse for #1 */}
        {isFirst && (
          <motion.div
            className="absolute -inset-3 rounded-full border-2 border-yellow-400/20"
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Name */}
      <motion.h3
        className={`mt-4 font-bold text-white text-center max-w-[140px] truncate ${isFirst ? 'text-lg' : 'text-sm'}`}
        style={{ transform: 'translateZ(10px)' }}
      >
        {citizen.label}
      </motion.h3>

      <div
        className={`mt-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tier.chipClass}`}
        style={{ transform: 'translateZ(12px)' }}
      >
        {tier.name}
      </div>

      {citizen.streakDays > 0 && (
        <div className="mt-2 flex items-center gap-1.5" style={{ transform: 'translateZ(12px)' }}>
          <span className="relative inline-flex">
            <motion.span
              animate={{ 
                scale: [1, 1.35, 1],
                opacity: [0.8, 1, 0.8],
                filter: ['drop-shadow(0 0 4px rgba(251,146,60,0.4))', 'drop-shadow(0 0 12px rgba(251,146,60,0.9))', 'drop-shadow(0 0 4px rgba(251,146,60,0.4))'],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              className="text-orange-400 text-sm"
            >
              🔥
            </motion.span>
            {Array.from({ length: 6 }, (_, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ 
                  left: '50%', 
                  bottom: '100%',
                  width: 2 + Math.random() * 2.5,
                  height: 2 + Math.random() * 2.5,
                  background: `radial-gradient(circle, ${i % 2 === 0 ? '#fbbf24' : '#fb923c'}, #ef4444)`,
                  boxShadow: `0 0 ${3 + Math.random() * 4}px rgba(251,146,60,0.7)`,
                }}
                animate={{
                  y: [0, -18 - Math.random() * 14],
                  x: [(Math.random() - 0.5) * 14, (Math.random() - 0.5) * 20],
                  opacity: [0.95, 0],
                  scale: [1, 0.15],
                }}
                transition={{
                  duration: 0.7 + Math.random() * 0.5,
                  delay: i * 0.16,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </span>
          <span className="text-[10px] font-bold text-orange-300" style={{ textShadow: '0 0 8px rgba(251,146,60,0.5)' }}>{citizen.streakDays}d</span>
        </div>
      )}

      {/* Score card - 3D lifted */}
      <motion.div
        whileHover={{ translateZ: 25, scale: 1.03 }}
        className={`mt-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-5 py-3.5 text-center
          ${isFirst ? 'min-w-[185px]' : 'min-w-[150px]'}
          group-hover:border-white/20 transition-colors duration-300`}
        style={{ transform: 'translateZ(15px)' }}
      >
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <Trophy className={`h-4 w-4 ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : 'text-amber-500'}`} />
          <span className="text-xs text-slate-300">{citizen.resolvedCount} resolved</span>
        </div>
        <p className="text-[10px] text-slate-400">{tier.level} • {tier.hindi}</p>
        <div className="flex items-center justify-center gap-1.5">
          <Heart className="h-4 w-4 text-cyan-400" />
          <span className={`font-extrabold text-white ${isFirst ? 'text-2xl' : 'text-xl'}`}>
            <AnimatedNumber value={citizen.civicScore} />
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Civic Score</p>
      </motion.div>

      <div className="mt-2 flex gap-[2px] justify-center" style={{ transform: 'translateZ(8px)' }}>
        {Array.from({ length: 35 }, (_, i) => {
          const hasActivity = Math.random() < (citizen.postedCount / 20);
          const intensity = hasActivity ? Math.random() : 0;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.02 }}
              className={`w-[4px] h-[4px] rounded-[1px] ${
                intensity === 0 ? 'bg-white/[0.05]' :
                intensity < 0.4 ? 'bg-emerald-800/40' :
                intensity < 0.7 ? 'bg-emerald-600/50' :
                'bg-emerald-400/60'
              }`}
              style={{ gridColumn: (i % 7) + 1, gridRow: Math.floor(i / 7) + 1 }}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

/* ── Interactive Row with 3D hover ── */
const LeaderboardRow = ({ citizen, rank, index }) => {
  const rowRef = useRef(null);
  const grad = avatarGradients[(index + 3) % avatarGradients.length];
  const tier = getCitizenLevel(getTierMetrics(citizen));

  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, x: -30, rotateY: -5 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ delay: 1.1 + index * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        scale: 1.015,
        x: 6,
        transition: { duration: 0.2 },
      }}
      className="group relative grid grid-cols-[60px_1fr_90px_110px_100px] sm:grid-cols-[80px_1fr_120px_140px_120px] gap-2 items-center px-4 sm:px-6 py-4 border-b border-white/[0.04] cursor-default"
    >
      {/* Hover glow bg */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/[0.04] via-cyan-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(16,185,129,0.06) 45%, rgba(16,185,129,0.08) 50%, rgba(16,185,129,0.06) 55%, transparent 60%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0%', '-100% 0%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
      />
      {/* Left accent bar on hover */}
      <motion.div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Rank */}
      <div className="relative flex items-center justify-center">
        <motion.span
          whileHover={{ scale: 1.15, rotate: 5 }}
          className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-sm font-bold text-slate-300 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-all duration-300"
        >
          {rank}
        </motion.span>
      </div>

      {/* Citizen */}
      <div className="relative flex items-center gap-3 min-w-0">
        <motion.div
          whileHover={{ scale: 1.12, rotate: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={citizen.avatarUrl ? undefined : { background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
        >
          {citizen.avatarUrl ? (
            <img src={citizen.avatarUrl} alt={citizen.label} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-white relative z-10">{getInitials(citizen.label)}</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent" />
        </motion.div>
        <div className="min-w-0">
          <div className="font-semibold text-white text-sm truncate group-hover:text-emerald-100 transition-colors">{citizen.label}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${tier.chipClass}`}>
              {tier.name}
            </span>
            {citizen.streakDays > 0 && (
              <span className="relative inline-flex items-center gap-0.5 ml-1">
                <motion.span
                  animate={{ 
                    scale: [1, 1.25, 1],
                    filter: ['drop-shadow(0 0 2px rgba(251,146,60,0.3))', 'drop-shadow(0 0 7px rgba(251,146,60,0.8))', 'drop-shadow(0 0 2px rgba(251,146,60,0.3))'],
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-[10px]"
                >
                  🔥
                </motion.span>
                {Array.from({ length: 3 }, (_, i) => (
                  <motion.span
                    key={i}
                    className="absolute rounded-full bg-orange-400"
                    style={{ left: '4px', bottom: '100%', width: 2, height: 2, boxShadow: '0 0 3px rgba(251,146,60,0.6)' }}
                    animate={{
                      y: [0, -10 - Math.random() * 8],
                      x: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 12],
                      opacity: [0.85, 0],
                      scale: [1, 0.2],
                    }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      delay: i * 0.2,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                ))}
                <span className="text-[9px] font-bold text-orange-400" style={{ textShadow: '0 0 5px rgba(251,146,60,0.4)' }}>{citizen.streakDays}d</span>
              </span>
            )}
            <span className="truncate text-xs text-slate-500">{citizen.cities || 'Multi-city'}</span>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="relative text-center">
        <span className="text-sm font-semibold text-slate-200">{citizen.postedCount}</span>
        <span className="text-xs text-slate-500 ml-1 hidden sm:inline">posted</span>
      </div>

      {/* Civic Score */}
      <div className="relative text-center">
        <span className="text-sm font-bold text-white">{citizen.civicScore.toLocaleString()}</span>
        <div className="text-[10px] text-slate-500">{tier.level}</div>
      </div>

      {/* Reward */}
      <div className="relative flex justify-center">
        <motion.span
          whileHover={{ scale: 1.1 }}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-400 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all duration-300"
        >
          <Heart className="h-3 w-3" />
          {getReward(rank)}
        </motion.span>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Leaderboard() {
  const [issues, setIssues] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');
  const timeLeft = useCountdown();

  const podiumRef = useRef(null);
  const podiumTilt = useTilt3D(podiumRef);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${BASE_API_URL}/api/issues?limit=100&sortBy=createdAt&order=desc`);
        if (!response.ok) throw new Error('Failed to fetch issues');
        const data = await response.json();
        const liveIssues = Array.isArray(data?.issues) ? data.issues : [];
        setIssues(liveIssues);
        setLoadError('');
      } catch (error) {
        console.error('Failed to fetch leaderboard issues:', error);
        setLoadError('Live leaderboard data is temporarily unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
    const intervalId = setInterval(fetchIssues, 30000);
    return () => clearInterval(intervalId);
  }, []);

  /* ── Computed data ── */
  const leaderboard = useMemo(() => {
    const citizens = new Map();
    issues.forEach((issue, index) => {
      const key = issue.userId || `anon-${index}`;
      const current = citizens.get(key) || {
        userId: key,
        label: toReporterLabel(issue, index),
        avatarUrl: issue.reporterAvatarUrl || issue.avatarUrl || '',
        postedCount: 0,
        resolvedCount: 0,
        totalVotesReceived: 0,
        totalPriorityDelivered: 0,
        cities: new Set(),
      };
      current.postedCount += 1;
      if (!current.avatarUrl && (issue.reporterAvatarUrl || issue.avatarUrl)) {
        current.avatarUrl = issue.reporterAvatarUrl || issue.avatarUrl;
      }
      current.totalVotesReceived += Number(issue.votes || 0);
      current.totalPriorityDelivered += Number(issue.priorityScore || 0);
      if (issue.city) current.cities.add(issue.city);
      if (String(issue.status).toLowerCase() === 'resolved') current.resolvedCount += 1;
      citizens.set(key, current);
    });
    return [...citizens.values()]
      .map((c) => ({
        ...c,
        cities: [...c.cities].join(', '),
        civicScore: c.resolvedCount * 30 + c.totalVotesReceived + Math.round(c.totalPriorityDelivered / 10),
        streakDays: Math.min(50, c.postedCount),
      }))
      .sort((a, b) => {
        if (b.resolvedCount !== a.resolvedCount) return b.resolvedCount - a.resolvedCount;
        if (b.totalVotesReceived !== a.totalVotesReceived) return b.totalVotesReceived - a.totalVotesReceived;
        return b.civicScore - a.civicScore;
      })
      .slice(0, 12);
  }, [issues]);

  const communityHeatmap = useMemo(() => {
    const today = new Date();
    const cells = [];
    for (let d = 90; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      date.setHours(0, 0, 0, 0);
      const dayStr = date.toISOString().slice(0, 10);
      const count = issues.filter((issue) => {
        const created = new Date(issue.createdAt);
        return created.toISOString().slice(0, 10) === dayStr;
      }).length;
      cells.push({ key: dayStr, date, count });
    }
    return cells;
  }, [issues]);

  const maxHeatCount = useMemo(() => Math.max(1, ...communityHeatmap.map((c) => c.count)), [communityHeatmap]);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const stats = useMemo(() => {
    const resolved = issues.filter((i) => String(i.status).toLowerCase() === 'resolved');
    return {
      totalValidations: sum(issues.map((i) => Number(i.votes || 0))),
      resolvedByMunicipality: resolved.length,
      leaderboardCitizens: leaderboard.length,
      liveIssues: issues.length,
    };
  }, [issues, leaderboard]);

  /* ══ RENDER ══ */
  return (
    <main className="voting-leaderboard-page min-h-screen overflow-hidden relative" style={{ perspective: '1200px' }}>
      {/* ── Layered backgrounds ── */}
      <div className="absolute inset-0 bg-[#070d1a]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-25%,rgba(16,185,129,0.14),transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_85%_100%,rgba(6,182,212,0.08),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_10%_80%,rgba(139,92,246,0.06),transparent_60%)]" />

      {/* Decorative arc behind podium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[500px] rounded-b-[50%] bg-gradient-to-b from-slate-800/30 to-transparent pointer-events-none" />

      {/* Animated grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <ParticleField />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pt-8 pb-20">
        {/* ── Offline banner ── */}
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

        {/* ── Tab Toggle with 3D depth ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="relative flex rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            {['daily', 'monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative z-10 px-9 py-2.5 rounded-full text-sm font-semibold transition-all duration-300
                  ${activeTab === tab ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}

            {/* Sliding pill indicator */}
            <motion.div
              layout
              className="absolute top-1.5 bottom-1.5 rounded-full"
              style={{
                left: activeTab === 'daily' ? 6 : '50%',
                width: 'calc(50% - 6px)',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.7), rgba(6,182,212,0.7))',
                boxShadow: '0 0 25px rgba(16,185,129,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            />
          </div>
        </motion.div>

        {/* ═══ 3D PODIUM SECTION ═══ */}
        <motion.div
          ref={podiumRef}
          onMouseMove={podiumTilt.onMove}
          onMouseLeave={podiumTilt.onLeave}
          style={{
            rotateX: podiumTilt.rotateX,
            rotateY: podiumTilt.rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="mb-6"
        >
          {loading ? (
            <div className="flex items-end justify-center gap-8 h-[420px]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                  <div className={`rounded-full bg-slate-700/30 ${i === 2 ? 'w-28 h-28' : 'w-[88px] h-[88px]'}`} />
                  <div className="h-4 w-24 bg-slate-700/30 rounded" />
                  <div className="h-24 w-40 bg-slate-700/20 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : top3.length >= 3 ? (
            <div className="flex items-end justify-center gap-3 sm:gap-6 md:gap-10">
              {/* 2nd place */}
              <div className="flex flex-col items-center">
                <PodiumCard citizen={top3[1]} rank={2} index={1} />
                <PodiumPedestal rank={2} height={80} />
              </div>
              {/* 1st place */}
              <div className="flex flex-col items-center">
                <PodiumCard citizen={top3[0]} rank={1} index={0} />
                <PodiumPedestal rank={1} height={120} />
              </div>
              {/* 3rd place */}
              <div className="flex flex-col items-center">
                <PodiumCard citizen={top3[2]} rank={3} index={2} />
                <PodiumPedestal rank={3} height={60} />
              </div>
            </div>
          ) : top3.length > 0 ? (
            <div className="flex items-end justify-center gap-8 min-h-[340px]">
              {top3.map((citizen, i) => (
                <PodiumCard key={citizen.userId} citizen={citizen} rank={i + 1} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[300px]">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-slate-400 rounded-2xl border border-dashed border-slate-700 bg-white/[0.03] px-12 py-10"
              >
                <Trophy className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                <p className="font-semibold">No leaderboard data yet</p>
                <p className="text-sm mt-1 text-slate-500">Start reporting and validating civic issues</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* ── Countdown ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Timer className="h-5 w-5 text-emerald-400" />
            </motion.div>
            <span className="text-sm text-slate-400">Cycle ends in</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CountdownUnit value={timeLeft.days} label="Days" />
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-slate-500 text-xl font-bold mt-[-18px]"
            >:</motion.span>
            <CountdownUnit value={timeLeft.hours} label="Hours" />
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-slate-500 text-xl font-bold mt-[-18px]"
            >:</motion.span>
            <CountdownUnit value={timeLeft.minutes} label="Min" />
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-slate-500 text-xl font-bold mt-[-18px]"
            >:</motion.span>
            <CountdownUnit value={timeLeft.seconds} label="Sec" />
          </div>
        </motion.div>

        {/* ── Stats bar with hover interactions ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-5 sm:gap-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-5 sm:px-7 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
            {[
              { icon: Zap, label: 'Live Issues', value: stats.liveIssues, color: 'emerald' },
              { icon: ThumbsUp, label: 'Validations', value: stats.totalValidations, color: 'cyan' },
              { icon: CheckCircle2, label: 'Resolved', value: stats.resolvedByMunicipality, color: 'violet', hideOnMobile: true },
              { icon: Users, label: 'Ranked', value: stats.leaderboardCitizens, color: 'amber', hideOnMd: true },
            ].map(({ icon: Icon, label, value, color, hideOnMobile, hideOnMd }, i) => (
              <div key={label} className={`flex items-center gap-2 ${hideOnMobile ? 'hidden sm:flex' : ''} ${hideOnMd ? 'hidden md:flex' : ''}`}>
                {i > 0 && <div className={`w-px h-8 bg-white/[0.07] mr-1 ${hideOnMobile && i === 2 ? 'hidden sm:block' : ''} ${hideOnMd && i === 3 ? 'hidden md:block' : ''}`} />}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center`}
                >
                  <Icon className={`h-4 w-4 text-${color}-400`} />
                </motion.div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
                  <div className="text-sm font-bold text-white"><AnimatedNumber value={value} /></div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Community progress pill ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="flex justify-center mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="relative inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-5 py-2.5 overflow-hidden"
          >
            {/* Animated shimmer */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(16,185,129,0.08) 50%, transparent 60%)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['-100% 0%', '200% 0%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
            />
            <Sparkles className="h-4 w-4 text-emerald-400 relative z-10" />
            <span className="text-sm text-slate-200 relative z-10">
              Community earned <Heart className="h-3.5 w-3.5 text-cyan-400 inline mx-0.5 align-text-bottom" />
              <span className="font-bold text-white">{stats.totalValidations}</span> validations — ranking
              <span className="font-bold text-white ml-1">{stats.leaderboardCitizens}</span> citizens
            </span>
          </motion.div>
        </motion.div>

        {/* ═══ COMMUNITY PULSE HEATMAP ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mb-10"
        >
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-5 shadow-[0_8px_50px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Community Pulse</h3>
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span></span>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Last 90 days</span>
            </div>
            {/* Heatmap grid */}
            <div className="overflow-x-auto">
              <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(15, 1fr)' }}>
                {communityHeatmap.map((cell, i) => (
                  <motion.div
                    key={cell.key}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.6 + i * 0.003, duration: 0.3 }}
                    title={`${cell.date.toLocaleDateString('en-IN')} • ${cell.count} issue${cell.count !== 1 ? 's' : ''}`}
                    className={`aspect-square rounded-[3px] transition-all duration-200 hover:scale-[1.6] hover:rounded-sm hover:ring-1 hover:ring-emerald-400/40 cursor-crosshair ${getHeatmapCellClass(cell.count, maxHeatCount)}`}
                  />
                ))}
              </div>
            </div>
            {/* Legend */}
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-[9px] text-slate-500">Less</span>
              {['bg-slate-800/60', 'bg-emerald-900/50', 'bg-emerald-700/60', 'bg-emerald-500', 'bg-emerald-400'].map((cls, i) => (
                <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${cls}`} />
              ))}
              <span className="text-[9px] text-slate-500">More</span>
            </div>
          </div>
        </motion.div>

        {/* ═══ RANKING TABLE ═══ */}
        {rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm overflow-hidden shadow-[0_8px_50px_rgba(0,0,0,0.2)]">
              {/* Header */}
              <div className="grid grid-cols-[60px_1fr_90px_110px_100px] sm:grid-cols-[80px_1fr_120px_140px_120px] gap-2 px-4 sm:px-6 py-4 border-b border-white/[0.07] bg-white/[0.02]">
                {['Rank', 'Citizen', 'Reports', 'Civic Score', 'Reward'].map((h) => (
                  <span key={h} className={`text-[11px] font-semibold text-slate-500 uppercase tracking-[0.12em] ${['Reports', 'Civic Score', 'Reward'].includes(h) ? 'text-center' : ''}`}>
                    {h}
                  </span>
                ))}
              </div>

              {/* Rows */}
              {rest.map((citizen, i) => (
                <LeaderboardRow key={citizen.userId} citizen={citizen} rank={i + 4} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ CTA BANNER ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
          className="mt-12 relative group"
        >
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/10 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
          <div className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-r from-emerald-950/30 via-[#0b1120] to-cyan-950/30 backdrop-blur-sm p-7 sm:p-9 overflow-hidden">
            {/* Background orb */}
            <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-emerald-500/[0.06] blur-3xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                  >
                    <TrendingUp className="h-5 w-5 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-white">Ready to climb the ranks?</h2>
                </div>
                <p className="text-sm text-slate-400 max-w-lg leading-relaxed">
                  Post clear issue evidence, validate what you see nearby, and follow through until municipal resolution closes the loop. Every resolved report earns civic score points.
                </p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/community"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)] transition-shadow duration-300"
                  >
                    <Sparkles className="h-4 w-4" />
                    Community Feed
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/report"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-5 py-3 text-sm font-semibold text-slate-200 transition-all duration-300"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Submit Report
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
