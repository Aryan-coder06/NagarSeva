import React, { useRef, useMemo, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import './ScrollMorphHero.css';

// Import civic images
import heroPothole from '../../assets/hero_pothole.jpg';
import heroPark from '../../assets/hero_park.jpg';
import heroDashboard from '../../assets/hero_dashboard.jpg';
import heroReporting from '../../assets/hero_reporting.jpg';
import heroStreetlight from '../../assets/hero_streetlight.jpg';
import heroSkyline from '../../assets/hero_skyline.jpg';
import civicReporting from '../../assets/civic_reporting.jpg';
import smartCity from '../../assets/smart_city.jpg';
import transparencyImg from '../../assets/transparency.jpg';

const IMAGES = [
  heroPothole,
  heroPark,
  heroDashboard,
  heroReporting,
  heroStreetlight,
  heroSkyline,
  civicReporting,
  smartCity,
  transparencyImg,
  heroPothole,    // repeated to fill 18 slots
  heroPark,
  heroDashboard,
  heroReporting,
  heroStreetlight,
  heroSkyline,
  civicReporting,
  smartCity,
  transparencyImg,
];

const IMAGE_COUNT = IMAGES.length;
const CARD_W = 120;
const CARD_H = 90;

/* ── helper: compute positions for each animation phase ── */
function getScatteredPos(i, total, vw, vh) {
  // Golden-ratio scatter for a pleasing pseudo-random feel
  const phi = (1 + Math.sqrt(5)) / 2;
  const angle = i * phi * Math.PI * 2;
  const r = 0.25 + (i / total) * 0.35;
  return {
    x: vw / 2 + Math.cos(angle) * r * vw * 0.45 - CARD_W / 2,
    y: vh / 2 + Math.sin(angle) * r * vh * 0.45 - CARD_H / 2,
    rotate: ((i * 37) % 60) - 30,
    scale: 0.7 + Math.random() * 0.3,
  };
}

function getCirclePos(i, total, vw, vh) {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  const radius = Math.min(vw, vh) * 0.35;
  return {
    x: vw / 2 + Math.cos(angle) * radius - CARD_W / 2,
    y: vh / 2 + Math.sin(angle) * radius - CARD_H / 2,
    rotate: (angle * 180) / Math.PI + 90,
    scale: 1,
  };
}

function getArcPos(i, total, vw, vh) {
  // Rainbow arc from left to right across the bottom
  const t = i / (total - 1);
  const angle = Math.PI + t * Math.PI; // π to 2π (bottom arc)
  const radius = Math.min(vw, vh) * 0.38;
  return {
    x: vw / 2 + Math.cos(angle) * radius * 1.4 - CARD_W / 2,
    y: vh * 0.55 + Math.sin(angle) * radius * 0.7 - CARD_H / 2,
    rotate: ((angle * 180) / Math.PI - 270) * 0.3,
    scale: 0.85 + Math.sin(t * Math.PI) * 0.25,
  };
}

function getGridPos(i, total, vw, vh) {
  const cols = 6;
  const row = Math.floor(i / cols);
  const col = i % cols;
  const gridW = cols * (CARD_W + 20);
  const offsetX = (vw - gridW) / 2;
  return {
    x: offsetX + col * (CARD_W + 20),
    y: 60 + row * (CARD_H + 20),
    rotate: 0,
    scale: 1,
  };
}

/* ── single image card ── */
function ImageCard({ src, index, style }) {
  return (
    <motion.div
      className="scroll-morph-card"
      style={{
        position: 'absolute',
        width: CARD_W,
        height: CARD_H,
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        willChange: 'transform',
        ...style,
      }}
      initial={false}
    >
      <img
        src={src}
        alt={`civic-${index}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
        }}
        loading="lazy"
      />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   ScrollMorphHero — main exported component
   ══════════════════════════════════════════════ */
export default function ScrollMorphHero() {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDims({ w: rect.width, h: rect.height });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Smooth scroll value with spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
    restDelta: 0.001,
  });

  // Text opacity: visible from 0-0.15, fades to 0.5, then hides
  const textOpacity = useTransform(smoothProgress, [0, 0.08, 0.25, 0.4], [1, 1, 0.6, 0]);
  const textScale = useTransform(smoothProgress, [0, 0.3], [1, 0.9]);
  const subtitleOpacity = useTransform(smoothProgress, [0, 0.05, 0.2], [1, 1, 0]);

  // Pre-compute layout positions for all phases
  const layouts = useMemo(() => {
    const { w, h } = dims;
    return {
      scattered: Array.from({ length: IMAGE_COUNT }, (_, i) => getScatteredPos(i, IMAGE_COUNT, w, h)),
      circle: Array.from({ length: IMAGE_COUNT }, (_, i) => getCirclePos(i, IMAGE_COUNT, w, h)),
      arc: Array.from({ length: IMAGE_COUNT }, (_, i) => getArcPos(i, IMAGE_COUNT, w, h)),
      grid: Array.from({ length: IMAGE_COUNT }, (_, i) => getGridPos(i, IMAGE_COUNT, w, h)),
    };
  }, [dims]);

  return (
    <div
      ref={containerRef}
      className="scroll-morph-hero"
      style={{ height: '400vh', position: 'relative' }}
    >
      <div
        className="scroll-morph-hero__sticky"
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          width: '100%',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #f8faf9 0%, #eef5f0 100%)',
        }}
      >
        {/* Central text */}
        <motion.div
          className="scroll-morph-hero__text"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none',
            opacity: textOpacity,
            scale: textScale,
          }}
        >
          <h1
            style={{
              fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
              fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
              fontWeight: 700,
              color: '#1a2e35',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              margin: 0,
            }}
          >
            Your city, your voice.
          </h1>
          <motion.p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(0.75rem, 1.2vw, 0.95rem)',
              fontWeight: 500,
              color: '#7a8f97',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginTop: '1rem',
              opacity: subtitleOpacity,
            }}
          >
            Scroll to explore
          </motion.p>
        </motion.div>

        {/* Image cards — animated between layouts */}
        {IMAGES.map((src, i) => (
          <AnimatedCard
            key={i}
            src={src}
            index={i}
            progress={smoothProgress}
            layouts={layouts}
          />
        ))}
      </div>
    </div>
  );
}

/* ── AnimatedCard: interpolates between layout phases ── */
function AnimatedCard({ src, index, progress, layouts }) {
  /*
    Scroll phases:
    0.00 → 0.25 : circle (initial state)
    0.25 → 0.50 : circle → scattered
    0.50 → 0.75 : scattered → arc
    0.75 → 1.00 : arc → grid
  */

  const x = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [
    layouts.circle[index].x,
    layouts.circle[index].x,
    layouts.scattered[index].x,
    layouts.arc[index].x,
    layouts.grid[index].x,
  ]);

  const y = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [
    layouts.circle[index].y,
    layouts.circle[index].y,
    layouts.scattered[index].y,
    layouts.arc[index].y,
    layouts.grid[index].y,
  ]);

  const rotate = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [
    layouts.circle[index].rotate,
    layouts.circle[index].rotate,
    layouts.scattered[index].rotate,
    layouts.arc[index].rotate,
    layouts.grid[index].rotate,
  ]);

  const scale = useTransform(progress, [0, 0.25, 0.5, 0.75, 1], [
    layouts.circle[index].scale,
    layouts.circle[index].scale,
    layouts.scattered[index].scale,
    layouts.arc[index].scale,
    layouts.grid[index].scale,
  ]);

  return (
    <ImageCard
      src={src}
      index={index}
      style={{ x, y, rotate, scale }}
    />
  );
}
