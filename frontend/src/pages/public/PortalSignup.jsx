import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ChevronLeft, UserRound } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../contexts/AuthContext';
import signupImage from '../../assets/login.png';

const portalCopy = {
  citizen: {
    eyebrow: 'Citizen registration',
    title: 'Create your citizen reporting account',
    subtitle: 'Store your residence details, file civic complaints faster, and receive region-aware updates.',
    accent: 'from-emerald-500 to-teal-600',
    icon: UserRound,
    login: '/citizen/login',
    onboarding: '/onboarding/citizen',
  },
  municipality: {
    eyebrow: 'Municipal registration',
    title: 'Create your municipal operations account',
    subtitle: 'Register your department, represented area, and operating region for India-focused issue resolution.',
    accent: 'from-slate-900 to-emerald-800',
    icon: Building2,
    login: '/municipal/login',
    onboarding: '/onboarding/municipality',
  },
};

export default function PortalSignup({ portalType }) {
  const portal = useMemo(() => portalCopy[portalType], [portalType]);
  const { register, loginWithGoogle, isSignedIn, profile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const resolveDestination = (nextProfile) => {
    if (!nextProfile) return portal.onboarding;
    if (nextProfile.portalType && nextProfile.portalType !== portalType) return portal.login;

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

    return nextProfile.isProfileComplete || hasPortalData ? (portalType === 'municipality' ? '/admin/dashboard' : '/dashboard') : portal.onboarding;
  };

  useEffect(() => {
    if (!isSignedIn) return;
    navigate(resolveDestination(profile));
  }, [isSignedIn, profile, navigate, portalType]);

  const submitRegister = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.fullName.trim()) return setError('Full name is required');
    if (!/\S+@\S+\.\S+/.test(form.email)) return setError('A valid email is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    const result = await register(form.email, form.password, form.fullName.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed');
      return;
    }

    navigate(resolveDestination(result.profile ?? null));
  };

  const submitGoogle = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Google sign-in failed');
      return;
    }

    navigate(resolveDestination(result.profile ?? null));
  };

  const Icon = portal.icon;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 font-inter dark:bg-slate-950">
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

          <form onSubmit={submitRegister} className="mt-8 space-y-4">
            {[
              ['fullName', 'Full name', 'text'],
              ['email', 'Email address', 'email'],
              ['password', 'Password', 'password'],
              ['confirmPassword', 'Confirm password', 'password'],
            ].map(([key, label, type]) => (
              <input
                key={key}
                type={type}
                placeholder={label}
                value={form[key]}
                onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-slate-950 dark:text-white"
              />
            ))}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full rounded-2xl bg-gradient-to-r ${portal.accent} px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60`}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">or</span>
            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <button onClick={submitGoogle} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-emerald-400 dark:border-zinc-700 dark:bg-slate-950 dark:text-white">
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already registered?{' '}
            <Link to={portal.login} className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-300">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} className="hidden w-1/2 items-center justify-center px-10 md:flex">
        <div className="w-full max-w-xl overflow-hidden rounded-[32px] border border-white/20 bg-white/70 p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-900/70">
          <img src={signupImage} alt="" className="h-[40rem] w-full rounded-3xl object-contain" />
        </div>
      </motion.div>
    </div>
  );
}
