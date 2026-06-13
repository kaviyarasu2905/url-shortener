const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  device: {
    type: String,
    default: 'unknown'
  },
  browser: {
    type: String,
    default: 'unknown'
  },
  os: {
    type: String,
    default: 'unknown'
  }
}, { _id: false });

const UrlSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true
    },
    shortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    customAlias: {
      type: String,
      trim: true,
      default: null
    },
    clicks: {
      type: Number,
      default: 0
    },
    visits: [VisitSchema],
    expiresAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes on shortCode and user for optimized lookup
UrlSchema.index({ shortCode: 1 });
UrlSchema.index({ user: 1 });

module.exports = mongoose.model('Url', UrlSchema);
