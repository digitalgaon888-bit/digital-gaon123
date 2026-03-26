require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        if (process.env.DEV_MODE === 'true') {
            console.log('DEV_MODE: Proceeding with mock storage in memory instead of MongoDB.');
            app.listen(PORT, '0.0.0.0', () => {
                console.log(`Server is running on port ${PORT} (MOCK DB MODE)`);
            });
        }
    });
