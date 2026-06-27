import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  BookOpen,
  Building2,
  Info,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  Phone,
  Shield,
  User,
  UserRound,
  Vote,
  Trophy,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Switch from './DarkModeToggle';
import logo from '../../assets/logo.png';

const navLinks = [
  { title: 'About', href: '/about', icon: Info },
  { title: 'Contact', href: '/contact', icon: Phone },
  { title: 'Voting', href: '/voting-system', icon: Vote },
  { title: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { title: 'Issue Map', href: '/user-map', icon: Map },
  { title: 'Feedback', href: '/feedback', icon: MessageSquare },
];

export default function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);
  const rightDropdownRef = useRef(null);
  const { isSignedIn, logout, user, profile } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rightDropdownRef.current && !rightDropdownRef.current.contains(event.target)) {
        setRightDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMunicipalUser = profile?.portalType === 'municipality';
  const handleNav = (href) => {
    setMobileMenuOpen(false);
    navigate(href);
  };

  const handleLogout = async () => {
    await logout();
    setRightDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:bg-slate-950/70 dark:shadow-none transition-colors duration-300">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-20 items-center justify-between gap-3 xl:gap-4">
          <button onClick={() => navigate('/')} className="group flex shrink-0 items-center gap-3">
            <div className="relative">
              <img src={logo} alt="NagarSeva logo" className="h-10 w-auto transition-transform duration-300 group-hover:scale-105 md:h-11 lg:h-[2.85rem]" />
              <div className="absolute inset-0 rounded-full bg-green-500/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <div className="hidden sm:block">
              <div className="bg-gradient-to-r from-sky-600 via-cyan-500 to-emerald-500 bg-clip-text text-2xl font-black tracking-tight text-transparent transition-transform duration-300 group-hover:scale-[1.02] lg:text-[1.9rem]">
                NagarSeva
              </div>
            </div>
          </button>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 xl:gap-1 lg:flex">
            {navLinks.map((navItem) => {
              const Icon = navItem.icon;
              const isActive = location.pathname === navItem.href;
              return (
                <Link
                  key={navItem.title}
                  to={navItem.href}
                  className={`group relative flex shrink-0 items-center gap-2 whitespace-nowrap overflow-hidden rounded-xl px-2.5 py-2.5 text-[0.95rem] font-medium transition-all duration-300 xl:px-3 ${
                    isActive
                      ? 'border border-green-200/50 bg-white/60 text-green-700 backdrop-blur-lg dark:border-green-700/50 dark:bg-white/10 dark:text-green-300'
                      : 'text-gray-600 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-950/50 dark:hover:text-green-400'
                  }`}
                >
                  <Icon className={`relative z-10 h-4 w-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="relative z-10">{navItem.title}</span>
                </Link>
              );
            })}
          </nav>

          <button
            id="mobile-nav-toggle"
            className="group flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 transition-colors duration-300 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-900/50 lg:hidden"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-green-600 dark:text-green-400" />
            ) : (
              <Menu className="h-5 w-5 text-green-600 dark:text-green-400" />
            )}
          </button>

          <div className="hidden shrink-0 items-center gap-3 xl:gap-4 lg:flex">
            <button
              onClick={() => navigate('/report')}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-red-600 hover:to-red-700"
              title="Report urgent civic issue"
              aria-label="Report urgent civic issue"
            >
              <AlertTriangle className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
              <span>Report</span>
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 transition-colors duration-300 hover:bg-green-100 dark:bg-green-950/50 dark:hover:bg-green-900/50">
              <Switch />
            </div>

            <div className="relative" ref={rightDropdownRef}>
              <button
                onClick={() => setRightDropdownOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-green-600 hover:to-green-700"
                aria-label="Open user menu"
              >
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </button>

              <AnimatePresence>
              {rightDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-white/20 bg-white/90 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/90">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setRightDropdownOpen(false);
                        navigate('/resources');
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-950/50 dark:hover:text-green-400"
                    >
                      <BookOpen className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                      <span>Citizen Resources</span>
                    </button>

                    {!isSignedIn ? (
                      <>
                        <button
                          onClick={() => {
                            setRightDropdownOpen(false);
                            navigate('/citizen/login');
                          }}
                          className="mt-2 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:from-green-600 hover:to-green-700"
                        >
                          <UserRound className="h-4 w-4" />
                          <span>Citizen login</span>
                        </button>
                        <button
                          onClick={() => {
                            setRightDropdownOpen(false);
                            navigate('/municipal/login');
                          }}
                          className="mt-2 flex w-full items-center gap-3 rounded-xl border border-green-200 px-4 py-3 text-sm font-medium text-green-700 transition-all duration-200 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950/50"
                        >
                          <Building2 className="h-4 w-4" />
                          <span>Municipal login</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="my-2 border-t border-green-100 dark:border-green-900/20" />
                        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm dark:bg-green-950/40">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-cyan-600 text-sm font-bold text-white">
                              {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={user?.name || 'Profile'} className="h-full w-full object-cover" />
                              ) : (
                                ((user?.name || user?.email || 'NA').match(/\b\w/g) || []).slice(0, 2).join('').toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-zinc-900 dark:text-white">{user?.name || 'Citizen account'}</div>
                              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{user?.email}</div>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setRightDropdownOpen(false);
                            navigate(isMunicipalUser ? '/admin/dashboard' : '/dashboard');
                          }}
                          className="group mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-green-950/50 dark:hover:text-green-400"
                        >
                          {isMunicipalUser ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                          <span>{isMunicipalUser ? 'Municipal Dashboard' : 'Citizen Dashboard'}</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="group mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white dark:text-red-400"
                        >
                          <LogOut className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden border-t border-white/10 bg-white/90 backdrop-blur-2xl dark:bg-slate-950/90 lg:hidden"
        >
          <div className="px-4 py-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((navItem, index) => {
                const Icon = navItem.icon;
                return (
                  <motion.button
                    key={navItem.title}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleNav(navItem.href)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400"
                  >
                    <Icon className="h-4 w-4" />
                    {navItem.title}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-3 border-t border-zinc-200/50 pt-3 dark:border-zinc-800/50">
              {isSignedIn ? (
                <button onClick={handleLogout} className="btn-premium w-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                  Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleNav('/citizen/login')} className="btn-premium bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    Citizen
                  </button>
                  <button onClick={() => handleNav('/municipal/login')} className="btn-premium border border-zinc-300 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-slate-900 dark:text-white">
                    Municipal
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
