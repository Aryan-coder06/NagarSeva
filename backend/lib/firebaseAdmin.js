const admin = require('firebase-admin');

const getFirebaseCredential = () => {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (serviceAccountJson) {
        return admin.credential.cert(JSON.parse(serviceAccountJson));
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
        return admin.credential.cert({ projectId, clientEmail, privateKey });
    }

    return admin.credential.applicationDefault();
};

if (!admin.apps.length) {
    admin.initializeApp({
        credential: getFirebaseCredential(),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}

module.exports = admin;
