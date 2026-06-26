const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getMyProfile, upsertMyProfile } = require('../controllers/profileControl');

const router = express.Router();

router.get('/profile/me', requireAuth(), getMyProfile);
router.put('/profile/me', requireAuth(), upsertMyProfile);

module.exports = router;
