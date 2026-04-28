const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

// Dairy Customer — who gets milk daily
const dairyCustomerSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true }, // owner's email
    customerName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    morningQty: { type: Number, default: 0, min: 0 },   // litres per morning
    eveningQty: { type: Number, default: 0, min: 0 },   // litres per evening
    ratePerLitre: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = secondaryDB.model('DairyCustomer', dairyCustomerSchema);
