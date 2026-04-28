const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const healthPatientSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true }, // Doctor's email
    name: { type: String, required: true },
    phone: { type: String, required: true },
    age: Number,
    gender: String,
    lastVisit: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = secondaryDB.model('HealthPatient', healthPatientSchema);
