const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { SarvamAIClient } = require('sarvamai');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const ALLOWED_LANGUAGE_CODES = new Set([
    'unknown',
    'en-IN',
    'hi-IN',
    'bn-IN',
    'gu-IN',
    'kn-IN',
    'ml-IN',
    'mr-IN',
    'od-IN',
    'pa-IN',
    'ta-IN',
    'te-IN',
    'as-IN',
    'ur-IN',
    'ne-IN',
]);

const uploadMiddleware = fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
});

const sarvamClient = process.env.SARVAM_API_KEY
    ? new SarvamAIClient({ apiSubscriptionKey: process.env.SARVAM_API_KEY })
    : null;

router.post('/ai/transcribe', requireAuth(), uploadMiddleware, async (req, res) => {
    try {
        if (!sarvamClient) {
            return res.status(500).json({ error: 'Sarvam speech-to-text is not configured.' });
        }

        if (!req.files || !req.files.file) {
            return res.status(400).json({ error: 'No audio file uploaded.' });
        }

        const file = req.files.file;
        const maxSize = 15 * 1024 * 1024;
        const allowedTypes = [
            'audio/webm',
            'audio/wav',
            'audio/x-wav',
            'audio/wave',
            'audio/mpeg',
            'audio/mp3',
            'audio/mp4',
            'audio/x-m4a',
            'audio/aac',
            'audio/ogg',
            'audio/opus',
            'audio/flac',
            'video/webm',
        ];

        if (file.size > maxSize) {
            removeTmp(file.tempFilePath);
            return res.status(400).json({ error: 'Audio is too large. Use a file under 15 MB.' });
        }

        if (!allowedTypes.includes(file.mimetype)) {
            removeTmp(file.tempFilePath);
            return res.status(400).json({ error: 'Unsupported audio format. Use WebM, WAV, MP3, M4A, AAC, OGG, OPUS, or FLAC.' });
        }

        const requestedLanguageCode = String(req.body?.languageCode || '').trim();
        const languageCode = ALLOWED_LANGUAGE_CODES.has(requestedLanguageCode)
            ? requestedLanguageCode
            : (process.env.SARVAM_STT_LANGUAGE || 'unknown');

        const response = await sarvamClient.speechToText.transcribe({
            file: {
                path: file.tempFilePath,
                filename: file.name,
                contentType: file.mimetype,
                contentLength: file.size,
            },
            model: process.env.SARVAM_STT_MODEL || 'saaras:v3',
            mode: process.env.SARVAM_STT_MODE || 'transcribe',
            language_code: languageCode,
        });

        removeTmp(file.tempFilePath);

        return res.json({
            transcript: response?.transcript || '',
            languageCode: response?.language_code || null,
            requestId: response?.request_id || null,
        });
    } catch (error) {
        if (req.files?.file?.tempFilePath) {
            removeTmp(req.files.file.tempFilePath);
        }

        console.error('Sarvam transcription failed:', error);
        return res.status(error?.statusCode || 500).json({
            error: error?.body?.message || error?.message || 'Speech-to-text failed.',
        });
    }
});

const removeTmp = (path) => {
    fs.unlink(path, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Failed to remove temp file:', err.message);
        }
    });
};

module.exports = router;
