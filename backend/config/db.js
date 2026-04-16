const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connString = process.env.MONGODB_URI;

        if (!connString) {
            console.warn('--- WARNING: MONGODB_URI is not defined in .env ---');
            console.warn('Backend will start but database operations will fail.');
            return;
        }

        const conn = await mongoose.connect(connString);
        console.log(`--- MONGODB CONNECTED: ${conn.connection.host} ---`);
    } catch (error) {
        console.error(`--- MONGODB CONNECTION ERROR: ${error.message} ---`);
        // We don't exit the process here to allow the server to "run" 
        // and show informative errors to the user instead of crashing completely.
    }
};

module.exports = connectDB;
