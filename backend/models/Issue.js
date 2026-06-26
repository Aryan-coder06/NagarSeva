const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  userId: { type: String},
  title: { type: String, required: true, trim: true },
  userMessage: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['open', 'in progress', 'pending', 'closed', 'resolved'], 
    default: 'open' 
  },
  category: { type: String, trim: true },
  imageUrl: { type: String },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  issueType: { type: String, trim: true },
  severity: { type: String, trim: true },
  urgency: { type: String, trim: true },
  suggestedDepartment: { type: String, trim: true },
  publicSummary: { type: String, trim: true },
  authoritySummary: { type: String, trim: true },
  recommendedAction: { type: String, trim: true },
  confidence: { type: Number },
  priorityScore: { type: Number, default: 0 },
  isLikelyDuplicate: { type: Boolean, default: false },
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Issue', default: null },
  duplicateCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
  duplicateClusterSize: { type: Number, default: 0 },
  verificationStatus: {
    type: String,
    enum: ['under review', 'community verified', 'flagged', 'approved', 'rejected', 'duplicate'],
    default: 'under review',
  },
  municipalDecision: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'duplicate'],
    default: 'pending',
  },
  decisionNote: { type: String, trim: true, default: '' },
  communityConfirmCount: { type: Number, default: 0 },
  communityFalseCount: { type: Number, default: 0 },
  communityDuplicateCount: { type: Number, default: 0 },
  trustScore: { type: Number, default: 0 },
  authenticityVotes: [{
    userId: { type: String, trim: true },
    voteType: {
      type: String,
      enum: ['confirm', 'false', 'duplicate'],
    },
    weight: { type: Number, default: 1 },
    city: { type: String, trim: true, default: '' },
    locality: { type: String, trim: true, default: '' },
    createdAt: { type: Date, default: Date.now },
  }],
  assignedToOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Officer', default: null },
  assignedToOfficerName: { type: String, trim: true, default: '' },
  assignedBy: { type: String, trim: true, default: '' },
  dueAt: { type: Date, default: null },
  escalationLevel: { type: Number, default: 0 },
  statusTimeline: [{
    status: { type: String, trim: true },
    note: { type: String, trim: true },
    actorId: { type: String, trim: true },
    actorType: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now }
  }],
  votes: { type: Number, default: 0 },
  voters: { type: Array, default: [] },
}, { timestamps: true }); // createdAt & updatedAt

module.exports = mongoose.model('Issue', issueSchema);
