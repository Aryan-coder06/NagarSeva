import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = ({ isOpen, onClose, mode = 'login' }) => {
    const [currentMode, setCurrentMode] = useState(mode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login, register, loginWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (currentMode === 'login') {
                const result = await login(email, password);
                if (result.success) {
                    onClose();
                } else {
                    setError(result.error);
                }
            } else {
                const result = await register(email, password, name);
                if (result.success) {
                    onClose();
                } else {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setLoading(true);
        setError('');
        const result = await loginWithGoogle();
        setLoading(false);
        if (result.success) {
            onClose();
            return;
        }
        setError(result.error || 'Google sign-in failed');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-green-200 bg-white/90 p-6 text-left text-zinc-800 shadow-2xl backdrop-blur-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl text-zinc-800 font-bold">
                        {currentMode === 'login' ? 'Sign In' : 'Sign Up'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {currentMode === 'register' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full outline-none p-2 border border-gray-300 rounded-md"
                                required
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full outline-none p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 outline-none border border-gray-300 rounded-md"
                            required
                        />
                    </div>

                    {error && (
                        <div className="mb-4 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white transition hover:from-green-600 hover:to-emerald-700 disabled:opacity-60"
                    >
                        {loading ? 'Loading...' : (currentMode === 'login' ? 'Sign In' : 'Sign Up')}
                    </button>
                </form>

                <div className="my-5 flex items-center gap-3 text-sm text-zinc-500">
                    <div className="h-px flex-1 bg-zinc-200" />
                    <span>or</span>
                    <div className="h-px flex-1 bg-zinc-200" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogle}
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-green-50 disabled:opacity-60"
                >
                    <FcGoogle className="h-5 w-5" />
                    Continue with Google
                </button>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => setCurrentMode(currentMode === 'login' ? 'register' : 'login')}
                        className="text-zinc-600 text-sm cursor-pointer hover:underline"
                    >
                        {currentMode === 'login' 
                            ? "Don't have an account? Sign up" 
                            : "Already have an account? Sign in"
                        }
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            navigate(currentMode === 'login' ? '/citizen/login' : '/citizen/signup');
                        }}
                        className="text-xs text-zinc-500 hover:text-zinc-700"
                    >
                        Open full page instead
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
