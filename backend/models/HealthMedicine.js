const mongoose = require('mongoose');
const { secondaryDB } = require('../config/db');

const healthMedicineSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true }, // Doctor's email
    name: { type: String, required: true },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'Tablets' },
    price: { type: Number, default: 0 },
    expiryDate: Date
}, { timestamps: true });

module.exports = secondaryDB.model('HealthMedicine', healthMedicineSchema);
