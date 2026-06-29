import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Building2, ClipboardList, LogOut, Menu, ShieldCheck, Users, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../shared/NotificationBell';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: BarChart3 },
  { to: '/admin/issues', label: 'Scoped Queue', icon: ClipboardList },
  { to: '/admin/officers', label: 'Team', icon: Users },
  { to: '/admin/logs', label: 'Logs', icon: ShieldCheck },
];

const navLinkClass = ({ isActive }) =>
  `inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
    isActive
      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
  }`;

export default function MunicipalNavbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { profile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/municipal/login');
  };

  const scopeLabel = [
    profile?.municipalityProfile?.city,
    profile?.municipalityProfile?.ward ? `Ward ${profile.municipalityProfile.ward}` : '',
    profile?.municipalityProfile?.zone ? `Zone ${profile.municipalityProfile.zone}` : '',
  ].filter(Boolean).join(' • ');

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/75 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-2xl dark:bg-slate-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-zinc-950 dark:text-white">NagarSeva Municipal</p>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {scopeLabel || 'Region-scoped operations'}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <NotificationBell dark />
          <div className="rounded-2xl border border-zinc-200 bg-white/80 px-4 py-2 dark:border-zinc-800 dark:bg-slate-900/80">
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">
              {profile?.municipalityProfile?.designation || 'Municipal role'}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {profile?.municipalityProfile?.department || 'Operational desk'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200 lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle municipal navigation"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-slate-950 lg:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass} onClick={() => setOpen(false)}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            <div className="pt-1">
              <NotificationBell dark />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}
