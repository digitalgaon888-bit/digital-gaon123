const mongoose = require('mongoose');
const { primaryDB } = require('../config/db');

const studyEntrySchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['completed', 'partial', 'missed'],
    required: true,
  },
}, { timestamps: true });

// Compound index to prevent duplicate entries for same user+date
studyEntrySchema.index({ userEmail: 1, date: 1 }, { unique: true });

module.exports = primaryDB.model('StudyEntry', studyEntrySchema);
