const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const healthVisitSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true }, // Doctor's email
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthPatient', required: true },
    patientName: String,
    patientPhone: String,
    symptoms: [String],
    diagnosis: String,
    prescription: [{
        medicineName: String,
        dosage: String, // e.g. 1-0-1
        duration: String // e.g. 5 days
    }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['Paid', 'Udhaar'], default: 'Paid' },
    date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = secondaryDB.model('HealthVisit', healthVisitSchema);
