const mongoose = require('mongoose');
const { primaryDB } = require('../config/db');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  redirectUrl: {
    type: String,
    default: '#',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  placement: {
    type: String,
    enum: ['main', 'grid'],
    default: 'grid',
  },
}, { timestamps: true });

module.exports = primaryDB.model('Ad', adSchema);
