const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/notificationControl');

const router = express.Router();

router.get('/notifications/me', requireAuth(), getMyNotifications);
router.patch('/notifications/:id/read', requireAuth(), markNotificationRead);
router.patch('/notifications/me/read-all', requireAuth(), markAllNotificationsRead);

module.exports = router;
