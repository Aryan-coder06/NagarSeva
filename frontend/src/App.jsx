import './App.css';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import AuroraBackground from './components/AuroraBackground';
import PageTransition from './components/PageTransition';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import PortalLogin from './pages/public/PortalLogin';
import PortalSignup from './pages/public/PortalSignup';
import ProfileOnboarding from './pages/public/ProfileOnboarding';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import Feedback from './pages/public/Feedback';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import Resources from './pages/public/Resources';
import VotingSystem from './pages/public/VotingSystem';
import Leaderboard from './pages/public/Leaderboard';
import PublicNavbar from './components/public/PublicNavbar';
import MunicipalNavbar from './components/municipal/MunicipalNavbar';
import Footer from './components/public/Footer';
import BotpressChat from './components/public/BotpressChat';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import CommunityFeed from './pages/CommunityFeed';
import AdminPanel from './pages/AdminPanel';
import ManageIssues from './pages/ManageIssues';
import ManageOfficers from './pages/ManageOfficers';
import Logs from './pages/Logs';
import NotFound from './pages/NotFound';

const INTRO_COOLDOWN_MS = 60 * 60 * 1000;
const INTRO_STORAGE_KEY = 'nagarseva_intro_last_seen';

const IntroVideoOverlay = ({ onClose }) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950 text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.22),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.14),transparent_24%)]" />
    <div className="relative w-full max-w-5xl px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">NagarSeva intro</p>
          <h2 className="mt-1 text-2xl font-bold">Loading civic intelligence</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/10"
        >
          Skip
        </button>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
        <video
          className="aspect-video w-full object-cover"
          src="/loading_video.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={onClose}
        />
      </div>
    </div>
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  </AuthProvider>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/citizen/login" element={<PageTransition><PortalLogin portalType="citizen" /></PageTransition>} />
        <Route path="/municipal/login" element={<PageTransition><PortalLogin portalType="municipality" /></PageTransition>} />
        <Route path="/citizen/signup" element={<PageTransition><PortalSignup portalType="citizen" /></PageTransition>} />
        <Route path="/municipal/signup" element={<PageTransition><PortalSignup portalType="municipality" /></PageTransition>} />
        <Route path="/onboarding/citizen" element={<PageTransition><ProfileOnboarding portalType="citizen" /></PageTransition>} />
        <Route path="/onboarding/municipality" element={<PageTransition><ProfileOnboarding portalType="municipality" /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/feedback" element={<PageTransition><Feedback /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
        <Route path="/voting-system" element={<PageTransition><VotingSystem /></PageTransition>} />
        <Route path="/leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
        <Route path="/user-map" element={<PageTransition><CommunityFeed /></PageTransition>} />
        <Route path="/community" element={<PageTransition><CommunityFeed /></PageTransition>} />
        <Route path="/report" element={<PageTransition><ReportIssue /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/admin/dashboard" element={<PageTransition><AdminPanel /></PageTransition>} />
        <Route path="/admin/issues" element={<PageTransition><ManageIssues /></PageTransition>} />
        <Route path="/admin/officers" element={<PageTransition><ManageOfficers /></PageTransition>} />
        <Route path="/admin/logs" element={<PageTransition><Logs /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const InnerApp = () => {
  const location = useLocation();
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/signup', '/citizen/login', '/municipal/login', '/citizen/signup', '/municipal/signup', '/onboarding/citizen', '/onboarding/municipality'].includes(location.pathname);
  const showPublicChrome = !isAdminRoute && !isAuthRoute;

  useEffect(() => {
    const lastSeen = Number(localStorage.getItem(INTRO_STORAGE_KEY) || 0);
    if (!lastSeen || Date.now() - lastSeen > INTRO_COOLDOWN_MS) {
      setShowIntroVideo(true);
    }
  }, []);

  const handleCloseIntro = () => {
    localStorage.setItem(INTRO_STORAGE_KEY, String(Date.now()));
    setShowIntroVideo(false);
  };

  return (
    <>
      {showIntroVideo && <IntroVideoOverlay onClose={handleCloseIntro} />}
      <AuroraBackground />
      <ToastContainer
        position="top-right"
        autoClose={3800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
        toastClassName={() => 'rounded-2xl border border-emerald-400/20 bg-slate-950/95 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl'}
        bodyClassName={() => 'p-0'}
        progressClassName="bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-500"
      />
      {showPublicChrome && <PublicNavbar />}
      {isAdminRoute && <MunicipalNavbar />}
      <AnimatedRoutes />
      {showPublicChrome && <Footer />}
      {showPublicChrome && <BotpressChat />}
    </>
  );
};

export default App;
