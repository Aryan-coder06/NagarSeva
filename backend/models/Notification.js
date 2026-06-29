const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientUserId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    recipientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    recipientName: {
      type: String,
      trim: true,
      default: '',
    },
    portalType: {
      type: String,
      enum: ['citizen', 'municipality'],
      default: 'citizen',
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    ctaLabel: {
      type: String,
      trim: true,
      default: '',
    },
    ctaUrl: {
      type: String,
      trim: true,
      default: '',
    },
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      default: null,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: {
      type: Date,
      default: null,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    emailStatus: {
      type: String,
      enum: ['skipped', 'queued', 'sent', 'failed'],
      default: 'queued',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
