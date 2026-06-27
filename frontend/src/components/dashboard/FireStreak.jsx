import { motion } from 'framer-motion';

const FireStreak = ({ streakDays = 0, className = '', compact = false }) => {
  const intensity = Math.min(1, streakDays / 50);
  const emberCount = compact ? 6 : Math.max(8, Math.round(12 + intensity * 3));
  const embers = Array.from({ length: emberCount }, (_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * (compact ? 30 : 60),
    size: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    duration: 1.4 + Math.random() * 1.2,
    drift: (Math.random() - 0.5) * 20,
    opacity: 0.5 + Math.random() * 0.5,
  }));

  if (compact) {
    return (
      <div className={`relative flex h-10 w-10 items-center justify-center ${className}`}>
        <style>{`
          @keyframes fire-pulse-compact {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.25); opacity: 1; }
          }
        `}</style>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(251,146,60,${0.4 + intensity * 0.3}) 0%, rgba(239,68,68,${0.2 + intensity * 0.2}) 50%, transparent 75%)`,
            animation: 'fire-pulse-compact 2s ease-in-out infinite',
          }}
        />
        {embers.map((ember) => (
          <motion.div
            key={ember.id}
            className="absolute rounded-full"
            style={{
              width: ember.size,
              height: ember.size,
              left: `calc(50% + ${ember.x * 0.5}px)`,
              bottom: '30%',
              background: `radial-gradient(circle, #fb923c, #ef4444)`,
            }}
            animate={{
              y: [0, -18 - Math.random() * 12],
              x: [0, ember.drift * 0.5],
              opacity: [ember.opacity, 0],
              scale: [1, 0.3],
            }}
            transition={{
              duration: ember.duration * 0.8,
              delay: ember.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
        <span
          className="relative z-10 text-lg font-black"
          style={{
            color: '#fb923c',
            textShadow: '0 0 8px rgba(251,146,60,0.8), 0 0 16px rgba(239,68,68,0.4)',
          }}
        >
          🔥
        </span>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center justify-center py-3 ${className}`}>
      <style>{`
        @keyframes fire-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes fire-flicker {
          0%, 100% { transform: scaleY(1) scaleX(1); }
          25% { transform: scaleY(1.05) scaleX(0.97); }
          50% { transform: scaleY(0.95) scaleX(1.03); }
          75% { transform: scaleY(1.08) scaleX(0.98); }
        }
      `}</style>

      {/* Base fire glow */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at center bottom, 
            rgba(251,146,60,${0.35 + intensity * 0.35}) 0%, 
            rgba(239,68,68,${0.2 + intensity * 0.2}) 35%, 
            rgba(220,38,38,${0.1 + intensity * 0.1}) 55%, 
            transparent 80%)`,
          animation: 'fire-pulse 2.5s ease-in-out infinite',
        }}
      />

      {/* Inner flame shape */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2"
        style={{
          width: `${50 + intensity * 30}%`,
          height: `${60 + intensity * 25}%`,
          background: `radial-gradient(ellipse at center bottom, 
            rgba(254,215,170,${0.3 + intensity * 0.2}) 0%, 
            rgba(251,146,60,${0.25 + intensity * 0.2}) 30%, 
            rgba(239,68,68,${0.15 + intensity * 0.15}) 60%, 
            transparent 85%)`,
          animation: 'fire-flicker 1.5s ease-in-out infinite',
          borderRadius: '50% 50% 40% 40%',
        }}
      />

      {/* Ember particles */}
      {embers.map((ember) => (
        <motion.div
          key={ember.id}
          className="absolute rounded-full"
          style={{
            width: ember.size,
            height: ember.size,
            left: `calc(50% + ${ember.x}px)`,
            bottom: '20%',
            background: `radial-gradient(circle, #fbbf24, #fb923c, #ef4444)`,
            boxShadow: `0 0 ${ember.size * 2}px rgba(251,146,60,0.6)`,
          }}
          animate={{
            y: [0, -40 - Math.random() * 30 - intensity * 20],
            x: [0, ember.drift],
            opacity: [ember.opacity, 0],
            scale: [1, 0.2],
          }}
          transition={{
            duration: ember.duration,
            delay: ember.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Streak number */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        <span
          className="text-4xl font-black tracking-tight"
          style={{
            color: '#fb923c',
            textShadow: `
              0 0 10px rgba(251,146,60,0.9),
              0 0 20px rgba(251,146,60,0.6),
              0 0 40px rgba(239,68,68,0.4),
              0 0 60px rgba(220,38,38,${0.1 + intensity * 0.2})
            `,
          }}
        >
          {streakDays}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-800/90 dark:text-orange-200/80">
          day streak
        </span>
      </div>
    </div>
  );
};

export default FireStreak;
