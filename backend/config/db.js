const mongoose = require('mongoose');

// Senior Architecture: Dual Database Architecture
// Currently mapped to PRIMARY for 100% stability.
const primaryDB = mongoose.createConnection(process.env.MONGODB_URI);
const secondaryDB = primaryDB; // Force secondary to use primary for now to fix 500 errors

primaryDB.on('connected', () => console.log(`--- DATABASE CONNECTED ✅ (Stable Mode) ---`));
primaryDB.on('error', (err) => console.log(`--- DATABASE CONNECTION ERROR: ${err.message} ---`));

module.exports = { primaryDB, secondaryDB };
