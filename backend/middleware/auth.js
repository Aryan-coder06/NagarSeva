const admin = require('../lib/firebaseAdmin');
const UserProfile = require('../models/UserProfile');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientNetworkError = (error) => {
    const message = error?.message || '';
    return (
        message.includes('EAI_AGAIN') ||
        message.includes('ENOTFOUND') ||
        message.includes('ECONNRESET') ||
        message.includes('ETIMEDOUT')
    );
};

const verifyIdTokenWithRetry = async (idToken, maxAttempts = 2) => {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            return await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            lastError = error;

            if (!isTransientNetworkError(error) || attempt === maxAttempts) {
                throw error;
            }

            console.warn(`Transient Firebase auth verification failure on attempt ${attempt}/${maxAttempts}: ${error.message}`);
            await sleep(300 * attempt);
        }
    }

    throw lastError;
};

const requireAuth = () => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const idToken = authHeader.substring(7);

            if (!idToken) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            const decodedToken = await verifyIdTokenWithRetry(idToken);

            req.auth = {
                uid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name,
                admin: decodedToken.admin === true || decodedToken.role === 'admin',
                claims: decodedToken,
            };

            next();
        } catch (error) {
            console.error('Auth middleware error:', error);

            if (isTransientNetworkError(error)) {
                return res.status(503).json({
                    error: 'Authentication service temporarily unavailable. Please retry.',
                });
            }

            return res.status(401).json({ error: 'Authentication failed' });
        }
    };
};

const requireAdmin = () => {
    return (req, res, next) => {
        if (req.auth?.admin) return next();
        return res.status(403).json({ error: 'Admin access required' });
    };
};

const requireMunicipal = () => {
    return async (req, res, next) => {
        try {
            if (req.auth?.admin) return next();

            const profile = await UserProfile.findOne({ firebaseUid: req.auth?.uid }).lean();

            if (profile?.portalType === 'municipality') {
                req.profile = profile;
                return next();
            }

            return res.status(403).json({ error: 'Municipal access required' });
        } catch (error) {
            console.error('Municipal access middleware error:', error);
            return res.status(500).json({ error: 'Unable to verify municipal access' });
        }
    };
};

module.exports = { requireAuth, requireAdmin, requireMunicipal };
