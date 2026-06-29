const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const limit = Math.min(50, Number(req.query.limit || 20));
    const notifications = await Notification.find({ recipientUserId: req.auth.uid })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipientUserId: req.auth.uid,
      readAt: null,
    });

    return res.status(200).json({
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error('Error loading notifications:', error);
    return res.status(500).json({ error: 'Unable to load notifications' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipientUserId: req.auth.uid,
      },
      {
        $set: { readAt: new Date() },
      },
      {
        new: true,
      }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ error: 'Unable to update notification' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipientUserId: req.auth.uid,
        readAt: null,
      },
      {
        $set: { readAt: new Date() },
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({ error: 'Unable to update notifications' });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
