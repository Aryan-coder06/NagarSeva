const mongoose = require('mongoose');

const citizenProfileSchema = new mongoose.Schema(
  {
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    locality: { type: String, trim: true },
    pincode: { type: String, trim: true },
    addressLine: { type: String, trim: true },
  },
  { _id: false }
);

const municipalityProfileSchema = new mongoose.Schema(
  {
    organizationName: { type: String, trim: true },
    department: { type: String, trim: true },
    designation: {
      type: String,
      trim: true,
      enum: ['Lead Manager', 'Regional Manager', 'Ward Supervisor', 'Field Officer', 'Officer'],
    },
    assignedCategories: {
      type: [String],
      default: [],
    },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true },
    zone: { type: String, trim: true },
    ward: { type: String, trim: true },
    locality: { type: String, trim: true },
    officeAddress: { type: String, trim: true },
  },
  { _id: false }
);

const notificationPreferencesSchema = new mongoose.Schema(
  {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    issueCreated: { type: Boolean, default: true },
    statusChanged: { type: Boolean, default: true },
    assignmentAlerts: { type: Boolean, default: true },
    authenticityAlerts: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  { _id: false }
);

const userProfileSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    portalType: {
      type: String,
      enum: ['citizen', 'municipality'],
      required: true,
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    citizenProfile: {
      type: citizenProfileSchema,
      default: () => ({}),
    },
    municipalityProfile: {
      type: municipalityProfileSchema,
      default: () => ({}),
    },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
