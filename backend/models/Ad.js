const mongoose = require('mongoose');

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

module.exports = mongoose.model('Ad', adSchema);
