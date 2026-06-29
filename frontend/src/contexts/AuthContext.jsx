import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { getMyProfile, upsertMyProfile } from '../api/Profile';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [claims, setClaims] = useState({});
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const loadProfile = async (firebaseUser = auth.currentUser) => {
        if (!firebaseUser) {
            setProfile(null);
            setProfileLoading(false);
            return null;
        }

        try {
            setProfileLoading(true);
            const token = await firebaseUser.getIdToken();
            const data = await getMyProfile(token);
            setProfile(data);
            return data;
        } catch (error) {
            if (error.response?.status === 404) {
                setProfile(null);
                return null;
            }
            console.error('Failed to load profile:', error);
            throw error;
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setClaims({});
                setProfile(null);
                setProfileLoading(false);
                setLoading(false);
                return;
            }

            try {
                const tokenResult = await firebaseUser.getIdTokenResult();
                setClaims(tokenResult.claims || {});
                setUser({
                    ...firebaseUser,
                    $id: firebaseUser.uid,
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                });
                await loadProfile(firebaseUser);
            } catch (error) {
                console.error('Failed to restore auth state:', error);
            } finally {
                setLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    const checkUser = async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return null;

        const tokenResult = await firebaseUser.getIdTokenResult(true);
        setClaims(tokenResult.claims || {});
        const normalizedUser = {
            ...firebaseUser,
            $id: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
        };
        setUser(normalizedUser);
        const loadedProfile = await loadProfile(firebaseUser);
        return { user: normalizedUser, profile: loadedProfile };
    };


    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            const authState = await checkUser();
            return { success: true, user: authState?.user, profile: authState?.profile ?? null };
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password, name) => {
        try {
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            if (name) {
                await updateProfile(credential.user, { displayName: name });
            }
            const authState = await checkUser();
            return { success: true, user: authState?.user, profile: authState?.profile ?? null };
        } catch (error) {
            console.error('Registration failed:', error);
            return { success: false, error: error.message };
        }
    };

    const loginWithGoogle = async () => {
        try {
            const credential = await signInWithPopup(auth, googleProvider);
            const userName = credential.user.displayName;
            if (!userName && credential.user.email) {
                const fallbackName = credential.user.email.split('@')[0];
                await updateProfile(credential.user, { displayName: fallbackName });
            }
            const authState = await checkUser();
            return {
                success: true,
                provider: GoogleAuthProvider.PROVIDER_ID,
                user: authState?.user,
                profile: authState?.profile ?? null,
            };
        } catch (error) {
            console.error('Google sign-in failed:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setProfile(null);
            return { success: true };
        } catch (error) {
            console.error('Logout failed:', error);
            return { success: false, error: error.message };
        }
    };

    const getToken = async () => {
        try {
            return await auth.currentUser?.getIdToken();
        } catch (error) {
            console.error('Failed to get token:', error);
            return null;
        }
    };

    const isAdmin = () => {
        try {
            const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '')
                .split(',')
                .map((email) => email.trim().toLowerCase())
                .filter(Boolean);

            return Boolean(
                claims.admin ||
                claims.role === 'admin' ||
                (user?.email && adminEmails.includes(user.email.toLowerCase()))
            );
        } catch (error) {
            console.error('Failed to check admin status:', error);
            return false;
        }
    }

    const isMunicipal = () => {
        return Boolean(
            claims.admin ||
            claims.role === 'admin' ||
            profile?.portalType === 'municipality'
        );
    };

    const saveProfile = async (payload) => {
        try {
            const token = await auth.currentUser?.getIdToken();
            if (!token) {
                return { success: false, error: 'Authentication token unavailable' };
            }

            const savedProfile = await upsertMyProfile(payload, token);
            setProfile(savedProfile);
            return { success: true, profile: savedProfile };
        } catch (error) {
            console.error('Failed to save profile:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to save profile',
            };
        }
    };

    const value = useMemo(() => ({
        user,
        loading,
        profile,
        profileLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        getToken,
        isSignedIn: !!user,
        checkUser,
        isAdmin,
        isMunicipal,
        saveProfile,
        refreshProfile: loadProfile,
    }), [user, loading, claims, profile, profileLoading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
