const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const healthQueueSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true }, // Doctor's email
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPatient' },
    patientName: String,
    tokenNumber: Number,
    status: { type: String, enum: ['Waiting', 'Checked', 'Cancelled'], default: 'Waiting' },
    date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = secondaryDB.model('HealthQueue', healthQueueSchema);
