import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import signupImage from '../../assets/login.png';

export default function Signup() {
  const { register, loginWithGoogle, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      navigate('/citizen/signup');
    }
  }, [isSignedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(email)) nextErrors.email = 'Please enter a valid email';
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    const result = await register(email, password, name.trim());
    setLoading(false);
    if (!result.success) {
      setErrors({ form: result.error || 'Registration failed' });
      return;
    }
    navigate('/onboarding/citizen');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (!result.success) {
      setErrors({ form: result.error || 'Google sign-in failed' });
      return;
    }
    navigate('/onboarding/citizen');
  };

  const inputClass = 'w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-800 p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all duration-300';

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-50 dark:bg-slate-950">
      {/* Form Side */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full justify-center px-4 md:w-1/2"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full max-w-md rounded-[28px] border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 shadow-2xl md:p-10"
        >
          <h2 className="mb-2 text-center text-3xl font-bold font-heading bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Create your account
          </h2>
          <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            This quick path creates a citizen account. Municipal staff should use the municipal registration flow.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && <p className="pt-1 text-sm text-red-500 dark:text-red-400"><FaExclamationCircle className="mr-1 inline" />{errors.name}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="Email address"
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="pt-1 text-sm text-red-500 dark:text-red-400"><FaExclamationCircle className="mr-1 inline" />{errors.email}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="pt-1 text-sm text-red-500 dark:text-red-400"><FaExclamationCircle className="mr-1 inline" />{errors.password}</p>}
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="pt-1 text-sm text-red-500 dark:text-red-400"><FaExclamationCircle className="mr-1 inline" />{errors.confirmPassword}</p>}
            </div>
            {errors.form && <p className="text-sm text-red-500 dark:text-red-400">{errors.form}</p>}
            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <hr className="flex-grow border-zinc-200 dark:border-zinc-700" />
            <span className="px-3 text-sm text-zinc-400 dark:text-zinc-500">OR</span>
            <hr className="flex-grow border-zinc-200 dark:border-zinc-700" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="btn-premium flex w-full items-center justify-center gap-3 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-800 py-3 font-medium text-zinc-700 dark:text-zinc-200 transition-all duration-300 hover:border-emerald-400 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <div className="mt-6 space-y-3 text-center">
            <Link to="/citizen/login" className="block text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400">
              Already have a citizen account? Sign in
            </Link>
            <Link to="/municipal/signup" className="block text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400">
              Municipal registration
            </Link>
            <Link to="/" className="inline-block text-sm text-zinc-400 dark:text-zinc-500 transition-colors duration-200 hover:text-zinc-700 dark:hover:text-zinc-300">
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Illustration Side */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden w-1/2 items-center justify-center bg-transparent md:flex relative"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-br from-teal-400/40 via-cyan-300/30 to-emerald-400/20 dark:from-teal-500/20 dark:via-cyan-400/15 dark:to-emerald-500/10 blur-3xl" />
        </div>
        <motion.img
          src={signupImage}
          alt="Signup Illustration"
          className="relative z-10 h-[80vh] w-full rounded-xl object-contain drop-shadow-2xl"
          animate={{ y: [0, -20, 0], rotate: [0, -1, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}
