const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const pashuUdhaarSchema = new mongoose.Schema({
    email: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerPhone: String,
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    isSettle: { type: Boolean, default: false }
});

module.exports = secondaryDB.model('PashuUdhaar', pashuUdhaarSchema);
