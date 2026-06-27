import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence, useInView } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './About.css';
import mission from '../../assets/mission.png';
import civicReporting from '../../assets/civic_reporting.jpg';
import smartCity from '../../assets/smart_city.jpg';
import transparencyImg from '../../assets/transparency.jpg';
import heroDashboard from '../../assets/hero_dashboard.jpg';
import heroSkyline from '../../assets/hero_skyline.jpg';
import heroPothole from '../../assets/hero_pothole.jpg';
import heroReporting from '../../assets/hero_reporting.jpg';
import heroStreetlight from '../../assets/hero_streetlight.jpg';
import heroPark from '../../assets/hero_park.jpg';
import {
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  Bot,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Globe,
  Heart,
  Layers,
  MapPin,
  MessageSquare,
  Route,
  Shield,
  Smartphone,
  Sparkles,
  Target,
  ThumbsUp,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════ */
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const fadeRight = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

/* ═══════════════════════════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════════════════════════ */

/* 3D tilt tracking */
const useTilt3D = (ref, intensity = 10) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 200, damping: 20 });
  const onMove = useCallback((e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }, [ref, x, y]);
  const onLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  return { rotateX, rotateY, onMove, onLeave };
};

/* Animated counter */
const useCounter = (target, duration = 1500) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);
  return { value, ref };
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── 3D Floating Geometric Shapes ── */
const FloatingShapes = () => (
  <div className="about-floating-shapes" aria-hidden="true">
    {/* Cube */}
    <div className="about-geo-shape about-geo-cube" style={{ transformStyle: 'preserve-3d' }}>
      {[...Array(6)].map((_, i) => <div key={i} className="about-geo-cube-face" />)}
    </div>
    {/* Ring */}
    <div className="about-geo-shape about-geo-ring" />
    {/* Diamond */}
    <div className="about-geo-shape about-geo-diamond" />
    {/* Sphere */}
    <div className="about-geo-shape about-geo-sphere" />
    {/* Octahedron */}
    <div className="about-geo-shape about-geo-octa" style={{ transformStyle: 'preserve-3d' }}>
      {[...Array(4)].map((_, i) => <div key={i} className="about-geo-octa-face" />)}
    </div>
    {/* Torus */}
    <div className="about-geo-shape about-geo-torus" />
  </div>
);

/* ── Particle system ── */
const Particles = () => {
  const dots = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 1,
        dur: Math.random() * 18 + 14,
        delay: Math.random() * 8,
        color: ['#10b981', '#06b6d4', '#8b5cf6'][i % 3],
        opacity: Math.random() * 0.35 + 0.08,
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {dots.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, opacity: p.opacity }}
          animate={{ y: [0, -100, -200], opacity: [p.opacity, p.opacity * 1.3, 0] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ icon: Icon, label, target, suffix = '', color }) => {
  const { value, ref } = useCounter(target);
  return (
    <motion.div ref={ref} variants={fadeUp} className="about-stat-card group" whileHover={{ y: -4, scale: 1.03 }}>
      <div className={`mx-auto mb-3 w-12 h-12 rounded-xl bg-${color}-500/15 flex items-center justify-center`}>
        <Icon className={`h-5 w-5 text-${color}-400`} />
      </div>
      <div className="text-3xl font-extrabold text-white">{value.toLocaleString()}{suffix}</div>
      <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</div>
    </motion.div>
  );
};

/* ── Horizontal Scroll Card ── */
const HScrollCard = ({ step, index }) => {
  const ref = useRef(null);
  const tilt = useTilt3D(ref, 8);
  const colors = ['emerald', 'cyan', 'violet', 'amber', 'rose'];
  const c = colors[index % colors.length];

  return (
    <motion.div
      ref={ref}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: 'preserve-3d' }}
      className="about-hscroll-card"
    >
      <div style={{ transform: 'translateZ(10px)' }}>
        <div className={`w-12 h-12 rounded-xl bg-${c}-500/15 flex items-center justify-center mb-4`}>
          <step.icon className={`h-6 w-6 text-${c}-400`} />
        </div>
        <div className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3 bg-${c}-500/10 text-${c}-400 border border-${c}-500/20`}>
          Step {index + 1}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
      </div>
    </motion.div>
  );
};

/* ── Timeline Step ── */
const TimelineStep = ({ step, index }) => {
  const colors = ['emerald', 'cyan', 'violet', 'amber', 'rose', 'sky'];
  const c = colors[index % colors.length];
  return (
    <motion.div
      className="about-v-timeline-item"
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`about-v-timeline-dot about-v-timeline-dot--${c}`}>{index + 1}</div>
      <div className="about-v-timeline-card">
        <div className="flex items-center gap-3 mb-2">
          <step.icon className={`h-5 w-5 text-${c}-400`} />
          <h4 className="font-bold text-white text-base">{step.title}</h4>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
        {step.detail && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{step.detail}</p>}
      </div>
    </motion.div>
  );
};

/* ── Feature Card with 3D ── */
const FeatureCard = ({ feature, index }) => {
  const ref = useRef(null);
  const tilt = useTilt3D(ref, 6);
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformStyle: 'preserve-3d' }}
      className="about-feature-card"
      whileHover={{ y: -6 }}
    >
      <div style={{ transform: 'translateZ(8px)' }}>
        <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/15 flex items-center justify-center mb-4`}>
          <feature.icon className={`h-5 w-5 text-${feature.color}-400`} />
        </div>
        <h3 className="font-bold text-white text-base mb-1.5">{feature.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const processSteps = [
  {
    icon: Camera,
    title: 'Spot & Capture',
    description: 'See a pothole, broken light, or garbage pile? Open NagarSeva, take a photo, and pin the location on our map.',
    detail: 'Our app auto-detects your GPS coordinates and timestamps the report for authenticity.',
    image: heroPothole,
  },
  {
    icon: Bot,
    title: 'AI Analysis & Categorization',
    description: 'Our intelligent AI engine analyzes the image, categorizes the issue type, and assigns a severity score.',
    detail: 'Using computer vision and NLP, we extract context from your photo and description to ensure accurate routing.',
    image: smartCity,
  },
  {
    icon: Route,
    title: 'Smart Routing',
    description: 'The issue is automatically routed to the correct municipal department — roads, sanitation, electrical, water works.',
    detail: 'Our system matches issue categories to specific department skill sets, eliminating bureaucratic delays.',
    image: heroDashboard,
  },
  {
    icon: ClipboardCheck,
    title: 'Officer Assignment',
    description: 'A field officer is assigned based on proximity, expertise, and current workload balancing.',
    detail: 'Real-time availability tracking ensures the most appropriate responder is dispatched quickly.',
    image: heroReporting,
  },
  {
    icon: Bell,
    title: 'Live Status Updates',
    description: 'Track your report in real-time: submitted → acknowledged → in progress → resolved. Push notifications at every stage.',
    detail: 'Both the citizen and the assigned officer receive synchronized status updates.',
    image: heroStreetlight,
  },
  {
    icon: CheckCircle2,
    title: 'Resolution & Verification',
    description: 'Once resolved, the officer uploads proof. The community can verify and upvote the resolution quality.',
    detail: 'This feedback loop ensures accountability and continuous improvement of civic services.',
    image: transparencyImg,
  },
];

const horizontalSteps = [
  { icon: MapPin, title: 'Pin Location', description: 'Use our interactive map to mark the exact spot where you found the issue. GPS auto-detection makes it instant.' },
  { icon: Camera, title: 'Upload Evidence', description: 'Snap a photo or short video. Our AI extracts context — type of damage, severity level, environmental factors.' },
  { icon: Bot, title: 'AI Triage', description: 'Machine learning classifies the issue, assigns priority, suggests the responsible department, and estimates fix time.' },
  { icon: Route, title: 'Auto-Route', description: 'The report flows directly to the right municipal desk — no manual forwarding, no lost paperwork.' },
  { icon: BarChart3, title: 'Track Progress', description: 'Follow your report through every stage with real-time status bars, officer info, and estimated completion dates.' },
  { icon: ThumbsUp, title: 'Community Vote', description: 'Neighbors validate your report by upvoting. Higher votes = higher priority in the municipal queue.' },
  { icon: CheckCircle2, title: 'Resolved', description: 'The officer marks it done with before/after photos. The community verifies the fix quality.' },
  { icon: Award, title: 'Earn Civic Score', description: 'Every resolved report earns civic points. Climb the leaderboard and get recognized as a civic champion!' },
];

const features = [
  { icon: Camera, title: 'One-Tap Reporting', description: 'Report civic issues in under 30 seconds with photo, location, and AI-powered categorization.', color: 'emerald' },
  { icon: Bot, title: 'AI Intelligence', description: 'Computer vision + NLP to auto-categorize issues, detect severity, and suggest optimal response.', color: 'cyan' },
  { icon: Globe, title: 'Live Issue Map', description: 'Interactive city-wide map showing all reported issues, status, and resolution heatmaps.', color: 'violet' },
  { icon: Shield, title: 'Verified Resolution', description: 'Before/after photo proof with community verification ensures genuine resolution.', color: 'amber' },
  { icon: BarChart3, title: 'Analytics Dashboard', description: 'Municipal teams get real-time dashboards with trends, department performance, and citizen satisfaction.', color: 'rose' },
  { icon: Users, title: 'Community Voting', description: 'Neighbors upvote issues they care about. Community consensus drives municipal priorities.', color: 'sky' },
  { icon: Bell, title: 'Push Notifications', description: 'Real-time alerts for every status change — from submission to resolution confirmation.', color: 'emerald' },
  { icon: Award, title: 'Civic Leaderboard', description: 'Earn points for reports, votes, and resolved issues. Top citizens get recognition and rewards.', color: 'violet' },
];

const stats = [
  { icon: Users, label: 'Active Citizens', target: 23141, color: 'emerald' },
  { icon: Target, label: 'Issues Reported', target: 18750, color: 'cyan' },
  { icon: CheckCircle2, label: 'Issues Resolved', target: 14200, suffix: '+', color: 'violet' },
  { icon: Globe, label: 'Cities Covered', target: 85, color: 'amber' },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
function About() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const scrollTrackRef = useRef(null);
  const timelineContainerRef = useRef(null);
  const [activeScrollIdx, setActiveScrollIdx] = useState(0);
  const [activeTimelineStep, setActiveTimelineStep] = useState(0);

  /* Parallax */
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.6]);

  /* 3D Hero tilt */
  const heroTilt = useTilt3D(heroRef, 5);

  /* Horizontal scroll tracking */
  const handleScroll = useCallback(() => {
    const el = scrollTrackRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.firstChild?.offsetWidth || 380;
    const gap = 24;
    const idx = Math.round(scrollLeft / (cardWidth + gap));
    setActiveScrollIdx(Math.min(idx, horizontalSteps.length - 1));
  }, []);

  const scrollTo = useCallback((idx) => {
    const el = scrollTrackRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth || 380;
    const gap = 24;
    el.scrollTo({ left: idx * (cardWidth + gap), behavior: 'smooth' });
  }, []);

  const scrollHorizontal = useCallback((dir) => {
    const next = Math.max(0, Math.min(activeScrollIdx + dir, horizontalSteps.length - 1));
    scrollTo(next);
  }, [activeScrollIdx, scrollTo]);

  useEffect(() => {
    const el = scrollTrackRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <main className="about-page-root">
      {/* ── Background layers ── */}
      <div className="about-bg-layers" />
      <FloatingShapes />
      <Particles />

      <div className="relative z-10">
        {/* ═══════════════════════════════════════════
            HERO SECTION
            ═══════════════════════════════════════════ */}
        <motion.section
          ref={heroRef}
          onMouseMove={heroTilt.onMove}
          onMouseLeave={heroTilt.onLeave}
          style={{ rotateX: heroTilt.rotateX, rotateY: heroTilt.rotateY, y: heroY, opacity: heroOpacity, transformStyle: 'preserve-3d', perspective: 1200 }}
          className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4"
        >
          <div className="max-w-5xl mx-auto text-center" style={{ transform: 'translateZ(20px)' }}>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
            >
              {/* Badge */}
              <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-400">
                <Sparkles className="h-4 w-4" />
                Empowering 23,000+ Citizens
              </motion.div>

              {/* Title */}
              <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
                <span className="text-white">Report Issues.</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  Transform Your City.
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p variants={fadeUp} className="mt-6 mx-auto max-w-2xl text-lg text-slate-400 leading-relaxed">
                NagarSeva bridges the gap between citizens and municipal governance. Report civic issues with AI-powered intelligence, track resolutions in real-time, and watch your community transform.
              </motion.p>

              {/* CTA buttons */}
              <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                {!user && (
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/signup"
                      className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-3.5 text-base font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.45)] transition-shadow duration-300"
                    >
                      Start Reporting
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                )}
                <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/community"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-8 py-3.5 text-base font-semibold text-slate-200 hover:bg-white/[0.08] transition-all duration-300"
                  >
                    Explore Live Map
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Floating hero images */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-16 relative max-w-4xl mx-auto"
              style={{ transform: 'translateZ(30px)' }}
            >
              <div className="about-gradient-border">
                <div className="rounded-[22px] overflow-hidden">
                  <img src={heroDashboard} alt="NagarSeva Dashboard" className="w-full object-cover" style={{ maxHeight: 400 }} />
                </div>
              </div>
              {/* Floating smaller card */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-8 -right-4 sm:right-8 w-48 sm:w-56 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                style={{ transform: 'translateZ(40px)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-400">Issue Resolved!</span>
                </div>
                <p className="text-[11px] text-slate-400">Pothole on MG Road fixed. Verified by 12 citizens.</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════
            STATS
            ═══════════════════════════════════════════ */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-5xl mx-auto px-4 mb-20"
        >
          <div className="about-stat-grid">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════
            HORIZONTAL SCROLL — PROCEDURE
            ═══════════════════════════════════════════ */}
        <section className="mb-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4">
                <Layers className="h-3.5 w-3.5" />
                Swipe to Explore
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                The Journey of Every <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Report</span>
              </h2>
              <p className="mt-3 text-slate-400 max-w-xl mx-auto">
                From spotting an issue to celebrating its resolution — follow the complete lifecycle.
              </p>
            </motion.div>

            {/* Scroll navigation */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-slate-500">{activeScrollIdx + 1} / {horizontalSteps.length}</div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => scrollHorizontal(-1)}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
                  disabled={activeScrollIdx === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => scrollHorizontal(1)}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all"
                  disabled={activeScrollIdx >= horizontalSteps.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Horizontal track */}
            <div
              ref={scrollTrackRef}
              className="about-hscroll-track"
            >
              {horizontalSteps.map((step, i) => (
                <HScrollCard key={i} step={step} index={i} />
              ))}
            </div>

            {/* Dot indicators */}
            <div className="about-scroll-indicators">
              {horizontalSteps.map((_, i) => (
                <button
                  key={i}
                  className={`about-scroll-dot ${i === activeScrollIdx ? 'about-scroll-dot--active' : ''}`}
                  onClick={() => scrollTo(i)}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            DETAILED PROCEDURE TIMELINE
            ═══════════════════════════════════════════ */}
        <section className="mb-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  <Route className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold text-white">Complete Resolution Pipeline</h2>
              </div>
              <p className="text-slate-400 max-w-2xl">
                Every report follows a rigorous 6-step pipeline from citizen submission to verified community resolution.
              </p>
            </motion.div>

            <div ref={timelineContainerRef} className="grid lg:grid-cols-[1fr_1.2fr] gap-10 items-start">
              {/* Timeline */}
              <div className="about-v-timeline">
                {processSteps.map((step, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => setActiveTimelineStep(i)}
                  >
                    <TimelineStep step={step} index={i} />
                  </div>
                ))}
              </div>

              {/* Sticky image gallery — cycles through images per step */}
              <div className="hidden lg:block sticky top-24 space-y-5">
                {/* Main image that transitions */}
                <div className="about-gradient-border">
                  <div className="rounded-[22px] overflow-hidden relative" style={{ height: 280 }}>
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeTimelineStep}
                        src={processSteps[activeTimelineStep]?.image}
                        alt={processSteps[activeTimelineStep]?.title}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full object-cover absolute inset-0"
                      />
                    </AnimatePresence>
                    {/* Step label overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeTimelineStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/30 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-300">{activeTimelineStep + 1}</span>
                          </div>
                          <span className="text-sm font-semibold text-white">{processSteps[activeTimelineStep]?.title}</span>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Thumbnail strip */}
                <div className="flex gap-2">
                  {processSteps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTimelineStep(i)}
                      className={`relative flex-1 rounded-xl overflow-hidden transition-all duration-300 ${
                        i === activeTimelineStep
                          ? 'ring-2 ring-emerald-400/60 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'opacity-50 hover:opacity-80'
                      }`}
                      style={{ height: 52 }}
                    >
                      <img src={step.image} alt={step.title} className="w-full h-full object-cover" />
                      {i === activeTimelineStep && (
                        <motion.div
                          layoutId="thumb-indicator"
                          className="absolute inset-0 border-2 border-emerald-400/50 rounded-xl"
                          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Stats card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="about-glass-section !p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    <span className="font-bold text-white text-sm">Resolution Rate</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[35, 48, 42, 58, 65, 72, 68, 78, 85, 82, 91, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 rounded-t bg-gradient-to-t from-emerald-600/80 to-cyan-500/60"
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] text-slate-500">
                    <span>Jan</span><span>Jun</span><span>Dec</span>
                  </div>
                </motion.div>

                {/* Second image — civic reporting */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="about-gradient-border"
                >
                  <div className="rounded-[22px] overflow-hidden">
                    <img src={civicReporting} alt="Citizens reporting civic issues" className="w-full aspect-[16/9] object-cover" />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            IMAGE SHOWCASE — Visual Stories
            ═══════════════════════════════════════════ */}
        <section className="mb-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                See NagarSeva in <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">Action</span>
              </h2>
              <p className="mt-3 text-slate-400 max-w-xl mx-auto">
                From potholes to parks — real issues, real resolutions, real impact.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {/* Tall left */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0 }}
                className="col-span-2 row-span-2 about-gradient-border group"
              >
                <div className="rounded-[22px] overflow-hidden relative">
                  <img src={heroSkyline} alt="City skyline" className="w-full h-full object-cover aspect-square md:aspect-auto md:h-[420px] transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold text-white mb-2">Smart Cities</span>
                    <h3 className="text-lg font-bold text-white">Building Tomorrow's Cities Today</h3>
                    <p className="text-xs text-slate-300 mt-1">AI-powered civic governance for cleaner, safer neighborhoods</p>
                  </div>
                </div>
              </motion.div>

              {/* Top right 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="about-gradient-border group"
              >
                <div className="rounded-[22px] overflow-hidden relative">
                  <img src={heroPothole} alt="Pothole reporting" className="w-full h-[200px] object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-white">🚧 Road Issues</span>
                  </div>
                </div>
              </motion.div>

              {/* Top right 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="about-gradient-border group"
              >
                <div className="rounded-[22px] overflow-hidden relative">
                  <img src={heroStreetlight} alt="Streetlight repair" className="w-full h-[200px] object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-white">💡 Street Lighting</span>
                  </div>
                </div>
              </motion.div>

              {/* Bottom right 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="about-gradient-border group"
              >
                <div className="rounded-[22px] overflow-hidden relative">
                  <img src={heroPark} alt="Park restoration" className="w-full h-[200px] object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-white">🌳 Parks & Green</span>
                  </div>
                </div>
              </motion.div>

              {/* Bottom right 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
                className="about-gradient-border group"
              >
                <div className="rounded-[22px] overflow-hidden relative">
                  <img src={heroReporting} alt="Citizen reporting" className="w-full h-[200px] object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-xs font-semibold text-white">📱 Easy Reporting</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FEATURES GRID
            ═══════════════════════════════════════════ */}
        <section className="mb-24 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Everything You Need for <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Real Impact</span>
              </h2>
              <p className="mt-3 text-slate-400 max-w-xl mx-auto">
                Built with cutting-edge technology to make civic reporting effortless and impactful.
              </p>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {features.map((f, i) => (
                <FeatureCard key={i} feature={f} index={i} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            WHY NAGARSEVA — Image + Glass card
            ═══════════════════════════════════════════ */}
        <section className="mb-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="about-gradient-border">
                  <div className="rounded-[22px] overflow-hidden">
                    <img src={transparencyImg} alt="Transparent Governance" className="w-full aspect-[4/3] object-cover" />
                  </div>
                </div>
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-5">
                  <Heart className="h-3.5 w-3.5" />
                  Why NagarSeva
                </div>
                <h2 className="text-3xl font-extrabold text-white mb-4">
                  Building <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Trust</span> Between Citizens & Government
                </h2>
                <p className="text-slate-400 leading-relaxed mb-6">
                  NagarSeva isn't just an app — it's a movement. By making civic reporting transparent, accountable,
                  and rewarding, we create a virtuous cycle where citizens feel heard and municipalities can prioritize
                  effectively. Every resolved issue strengthens the bond between community and governance.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: Shield, text: 'End-to-end transparency with public tracking', color: 'emerald' },
                    { icon: Zap, text: 'Avg. response time reduced by 60%', color: 'cyan' },
                    { icon: TrendingUp, text: '95% citizen satisfaction rate', color: 'violet' },
                  ].map(({ icon: I, text, color }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-${color}-500/15 flex items-center justify-center flex-shrink-0`}>
                        <I className={`h-4 w-4 text-${color}-400`} />
                      </div>
                      <span className="text-sm text-slate-300">{text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            MISSION & VISION
            ═══════════════════════════════════════════ */}
        <section className="mb-24 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="about-glass-section"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-5">
                <Target className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">Our Mission</h3>
              <p className="text-slate-400 leading-relaxed">
                To empower every citizen to take meaningful action and improve their city by making civic reporting simple,
                transparent, and genuinely impactful. We believe that when citizens have a clear voice, cities listen — and transform.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['🇮🇳', '🏙️', '🌱'].map((e, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-sm">{e}</div>
                  ))}
                </div>
                <span className="text-xs text-slate-500">Serving 85+ Indian cities</span>
              </div>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="about-glass-section"
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-500/15 flex items-center justify-center mb-5">
                <Globe className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">Our Vision</h3>
              <p className="text-slate-400 leading-relaxed">
                A world where communities and governments work hand-in-hand to create cleaner, safer, and more livable cities
                for everyone. Where technology bridges the gap between civic intention and governmental action.
              </p>
              <div className="mt-6">
                <img src={mission} alt="Our vision for better cities" className="w-full rounded-xl max-h-40 object-cover opacity-80" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA BANNER
            ═══════════════════════════════════════════ */}
        <section className="mb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="about-cta-banner relative"
            >
              {/* Background orbs */}
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500/[0.06] blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-violet-500/[0.04] blur-3xl pointer-events-none" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                <div>
                  <h2 className="text-3xl font-extrabold text-white mb-3">Your City Needs You</h2>
                  <p className="text-slate-400 max-w-lg leading-relaxed">
                    Every report matters. Every vote counts. Join thousands of citizens who are already making their neighborhoods better, one resolved issue at a time.
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/report"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.45)] transition-shadow duration-300"
                    >
                      <Sparkles className="h-4 w-4" />
                      Report an Issue
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      to="/leaderboard"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-6 py-3.5 text-sm font-semibold text-slate-200 transition-all duration-300"
                    >
                      <Award className="h-4 w-4" />
                      Leaderboard
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default About;
