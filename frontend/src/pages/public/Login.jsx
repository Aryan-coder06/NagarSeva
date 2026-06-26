import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import loginImage from '../../assets/signup.png';

export default function Login() {
  const { login, loginWithGoogle, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      navigate('/citizen/login');
    }
  }, [isSignedIn, navigate]);

  useEffect(() => {
    if (!email) {
      setErrors((prev) => ({ ...prev, email: null }));
      setIsValid((prev) => ({ ...prev, email: false }));
      return;
    }
    if (/\S+@\S+\.\S+/.test(email)) {
      setErrors((prev) => ({ ...prev, email: null }));
      setIsValid((prev) => ({ ...prev, email: true }));
    } else {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email' }));
      setIsValid((prev) => ({ ...prev, email: false }));
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrors((prev) => ({ ...prev, form: 'Email and password are required' }));
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, form: result.error || 'Login failed' }));
      return;
    }
    navigate('/citizen/login');
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (!result.success) {
      setErrors((prev) => ({ ...prev, form: result.error || 'Google sign-in failed' }));
      return;
    }
    navigate('/citizen/login');
  };

  const emailBorderClass = errors.email
    ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
    : isValid.email
      ? 'border-emerald-500 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]'
      : 'border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]';

  return (
    <div className="relative flex min-h-screen items-center justify-center font-inter bg-zinc-50 dark:bg-slate-950 overflow-hidden">
      {/* Illustration Side */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden w-1/2 items-center justify-center bg-transparent md:flex relative"
      >
        {/* Decorative gradient orb behind image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[420px] h-[420px] rounded-full bg-gradient-to-br from-emerald-400/40 via-teal-300/30 to-cyan-400/20 dark:from-emerald-500/20 dark:via-teal-400/15 dark:to-cyan-500/10 blur-3xl" />
        </div>

        <motion.img
          src={loginImage}
          alt="Login Illustration"
          className="relative z-10 h-[80vh] w-full rounded-xl object-contain drop-shadow-2xl"
          animate={{ y: [0, -20, 0], rotate: [0, 1, -1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Form Side */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex w-full justify-center md:w-1/2 px-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="w-full max-w-md rounded-[28px] border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-8 shadow-2xl md:p-10"
        >
          <h2 className="mb-2 text-center text-3xl font-bold font-heading bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mb-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Choose the citizen or municipal portal to access the right workspace
          </p>

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                className={`w-full rounded-xl border-2 ${emailBorderClass} bg-white dark:bg-slate-800 p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none transition-all duration-300`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="flex items-center pt-1 text-sm text-red-500 dark:text-red-400">
                  <FaExclamationCircle className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-slate-800 p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)] transition-all duration-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {errors.form && (
              <p className="text-sm text-red-500 dark:text-red-400">{errors.form}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-premium w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/30 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Continue to citizen portal'}
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
            <Link
              to="/citizen/signup"
              className="block text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Need a citizen account? Sign up
            </Link>
            <Link
              to="/municipal/login"
              className="block text-sm text-zinc-500 dark:text-zinc-400 transition-colors duration-200 hover:text-emerald-600 dark:hover:text-emerald-400"
            >
              Municipal staff sign in here
            </Link>
            <Link
              to="/"
              className="inline-block text-sm text-zinc-400 dark:text-zinc-500 transition-colors duration-200 hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              ← Back to Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
