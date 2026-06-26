import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
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
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/signup', '/citizen/login', '/municipal/login', '/citizen/signup', '/municipal/signup', '/onboarding/citizen', '/onboarding/municipality'].includes(location.pathname);
  const showPublicChrome = !isAdminRoute && !isAuthRoute;

  return (
    <>
      <AuroraBackground />
      {showPublicChrome && <PublicNavbar />}
      {isAdminRoute && <MunicipalNavbar />}
      <AnimatedRoutes />
      {showPublicChrome && <Footer />}
      {showPublicChrome && <BotpressChat />}
    </>
  );
};

export default App;
