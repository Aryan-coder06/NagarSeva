import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Building2, ChevronLeft, Landmark, MapPinned, Shield, UserRound } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import loginImage from '../../assets/signup.png';

const portalCopy = {
  citizen: {
    eyebrow: 'Citizen portal',
    title: 'Sign in to your reporting workspace',
    subtitle: 'Track complaints, verify nearby issues, and manage your local civic contribution profile.',
    accent: 'from-emerald-500 to-teal-600',
    icon: UserRound,
    dashboard: '/dashboard',
    signup: '/citizen/signup',
  },
  municipality: {
    eyebrow: 'Municipal portal',
    title: 'Sign in to the civic operations desk',
    subtitle: 'Review regional queues, update resolutions, and manage ward-level accountability for your jurisdiction.',
    accent: 'from-slate-900 to-emerald-800',
    icon: Building2,
    dashboard: '/admin/dashboard',
    signup: '/municipal/signup',
  },
};

export default function PortalLogin({ portalType }) {
  const portal = useMemo(() => portalCopy[portalType], [portalType]);
  const { login, loginWithGoogle, isSignedIn, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resolveDestination = (nextProfile) => {
    if (!nextProfile) {
      return portalType === 'municipality' ? '/onboarding/municipality' : '/onboarding/citizen';
    }

    if (nextProfile.portalType !== portalType) {
      return null;
    }

    const hasPortalData = portalType === 'municipality'
      ? Boolean(
          nextProfile.municipalityProfile?.organizationName ||
          nextProfile.municipalityProfile?.department ||
          nextProfile.municipalityProfile?.city
        )
      : Boolean(
          nextProfile.citizenProfile?.state ||
          nextProfile.citizenProfile?.city ||
          nextProfile.citizenProfile?.locality
        );

    if (!nextProfile.isProfileComplete && !hasPortalData) {
      return portalType === 'municipality' ? '/onboarding/municipality' : '/onboarding/citizen';
    }

    return portal.dashboard;
  };

  useEffect(() => {
    if (!isSignedIn) return;
    const destination = resolveDestination(profile);
    if (destination) navigate(destination);
  }, [isSignedIn, profile, navigate, portalType]);

  const finishAuth = async (result) => {
    if (!result.success) {
      setError(result.error || 'Authentication failed');
      return;
    }

    const nextProfile = result.profile ?? null;
    const destination = resolveDestination(nextProfile);

    if (!destination) {
      setError(`This account is registered for the ${nextProfile?.portalType || 'other'} portal.`);
      return;
    }

    navigate(destination);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    await finishAuth(result);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    await finishAuth(result);
  };

  const Icon = portal.icon;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 font-inter dark:bg-slate-950">
      <motion.div initial={{ opacity: 0, x: -32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} className="hidden w-1/2 items-center justify-center px-10 md:flex">
        <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70">
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${portal.accent}`} />
          <div className="grid gap-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{portal.eyebrow}</p>
              <h1 className="font-heading mt-2 text-4xl font-bold text-zinc-950 dark:text-white">{portal.title}</h1>
              <p className="mt-3 max-w-lg text-sm leading-7 text-zinc-600 dark:text-zinc-300">{portal.subtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: MapPinned, label: 'Geo-tagged reports', value: 'India-first locality capture' },
                { icon: Landmark, label: 'Regional routing', value: 'Ward and zone aligned access' },
                { icon: Shield, label: 'Role separation', value: 'Citizen and municipal workspaces' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white/80 p-4 dark:border-zinc-800 dark:bg-slate-950/60">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                  <p className="mt-3 text-sm font-semibold text-zinc-950 dark:text-white">{item.label}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">{item.value}</p>
                </div>
              ))}
            </div>
            <img src={loginImage} alt="" className="h-[22rem] w-full rounded-3xl object-contain" />
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="flex w-full justify-center px-4 md:w-1/2">
        <div className="w-full max-w-md rounded-[30px] border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/80">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-6">
            <div className={`inline-flex rounded-2xl bg-gradient-to-r ${portal.accent} p-3 text-white shadow-lg`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{portal.eyebrow}</p>
            <h2 className="font-heading mt-2 text-3xl font-bold text-zinc-950 dark:text-white">{portal.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{portal.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-slate-950 dark:text-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-slate-950 dark:text-white"
            />

            {error && (
              <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full rounded-2xl bg-gradient-to-r ${portal.accent} px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`}>
              {loading ? 'Signing in...' : `Continue to ${portalType === 'municipality' ? 'municipal portal' : 'citizen portal'}`}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">or</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-400 dark:border-zinc-700 dark:bg-slate-950 dark:text-white">
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Need a new account?{' '}
            <Link to={portal.signup} className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300">
              Create one here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
