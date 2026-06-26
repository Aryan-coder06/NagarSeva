import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BarChart3, MapPinned, Menu, ShieldCheck, Siren, X, ChevronRight } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignOutButton } from './AuthComponents';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navLinkClass = ({ isActive }) =>
  `relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
    isActive ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 font-bold' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-slate-800 dark:hover:text-white'
  }`;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAdmin } = useAuth();
  const admin = isAdmin();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = admin
    ? [
        { to: '/admin/dashboard', label: 'Action Center', icon: ShieldCheck },
        { to: '/admin/issues', label: 'Issues', icon: Siren },
        { to: '/admin/logs', label: 'Logs', icon: BarChart3 },
      ]
    : [
        { to: user ? '/dashboard' : '/', label: user ? 'Dashboard' : 'Home', icon: BarChart3 },
        { to: '/community', label: 'Community Map', icon: MapPinned },
        { to: '/report', label: 'Report Issue', icon: Siren },
      ];

  return (
    <header 
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-sm' 
          : 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50'
      }`}
    >
      <nav className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-105">
            <MapPinned className="h-5 w-5" />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="font-heading text-lg font-bold text-zinc-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">NagarSeva</p>
            <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">AI Civic Action</p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <SignedIn>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm">
              {user?.name || user?.email}
            </div>
            <SignOutButton className="rounded-xl bg-zinc-950 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-zinc-950/10" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <span className="cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2 group">
                Sign in
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </SignInButton>
          </SignedOut>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 md:hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-4 md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {links.map((item) => (
                <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setIsOpen(false)}>
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
              <SignedIn>
                <div className="mb-4 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {user?.name || user?.email}
                </div>
                <SignOutButton className="w-full rounded-xl bg-zinc-950 dark:bg-white px-4 py-3 text-sm font-semibold text-white dark:text-zinc-950 shadow-md" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <span className="block w-full cursor-pointer rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/25">
                    Sign in
                  </span>
                </SignInButton>
              </SignedOut>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
