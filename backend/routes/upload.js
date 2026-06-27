const express = require('express');
const fileUpload = require('express-fileupload');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { requireAuth } = require('../middleware/auth');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const uploadMiddleware = fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
});

router.post('/upload', requireAuth(), uploadMiddleware, async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0)
            return res.status(400).send({ msg: "No files were uploaded" });

        const file = req.files.file;
        const isVideo = String(file.mimetype || '').startsWith('video/');
        const maxSize = isVideo ? 25 * 1024 * 1024 : 10 * 1024 * 1024;

        if (file.size > maxSize) {
            removeTmp(file.tempFilePath);
            return res.status(400).json({ msg: isVideo ? "Video is too large. Use a file under 25 MB." : "Image is too large. Use a file under 10 MB." });
        }

        const allowedImageTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/avif',
            'image/heic',
            'image/heif'
        ];
        const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
        const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

        if (!allowedTypes.includes(file.mimetype)) {
            removeTmp(file.tempFilePath);
            return res.status(400).json({ msg: "Unsupported file format. Use JPG, PNG, WEBP, MP4, WEBM, or MOV." });
        }

        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: 'NagarSevaIssueReports',
            resource_type: 'auto'
        });
        removeTmp(file.tempFilePath);

        return res.json({
            public_id: result.public_id,
            url: result.secure_url,
            mediaType: isVideo ? 'video' : 'image'
        });
    } catch (err) {
        if (req.files?.file?.tempFilePath) {
            removeTmp(req.files.file.tempFilePath);
        }
        console.error('Cloudinary upload failed:', err);
        res.status(500).json({
            msg: err?.error?.message || err?.message || 'Image upload failed',
        });
    }
});

router.post('/destroy', requireAuth(), async (req, res) => {
    try {
        const { public_id } = req.body;
        if (!public_id) return res.status(400).json({ msg: "No images Selected" });

        await cloudinary.uploader.destroy(public_id);
        return res.json({ msg: "Image Deleted Successfully" });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
});

const removeTmp = (path) => {
    fs.unlink(path, err => {
        if (err && err.code !== 'ENOENT') {
            console.error('Failed to remove temp file:', err.message);
        }
    });
}

module.exports = router;
