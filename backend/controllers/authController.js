const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');

// IN-MEMORY FALLBACK (for when MongoDB is not connected)
const otpCache = new Map();


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS (Recommended for Gmail on 587)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false // Helps in some local environments
    }
});


exports.sendOtp = async (req, res) => {
    console.log('--- Send OTP Request Received ---');
    try {
        const { email } = req.body;
        console.log('Email to send to:', email);
        
        if (!email) {
            console.log('Error: No email provided in request body');
            return res.status(400).json({ message: 'Email is required' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to DB or Memory
        if (process.env.DEV_MODE === 'true') {
            console.log('DEV_MODE is true. Skipping DB operation.');
            otpCache.set(email, { otp, expiresAt });
        } else {
            console.log('Attempting to save OTP...');
            try {
                await Otp.findOneAndUpdate(
                    { email },
                    { otp, expiresAt },
                    { upsert: true, new: true }
                );
                console.log('OTP saved to MongoDB successfully.');
            } catch (dbError) {
                console.log('DB Save Error (Using In-Memory Fallback):', dbError.message);
                otpCache.set(email, { otp, expiresAt });
            }
        }

        // Send email
        const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_USER !== 'your_gmail@gmail.com' && process.env.EMAIL_PASS !== 'your_app_password';
        console.log('Is email configured?', isEmailConfigured);
        
        if (!isEmailConfigured) {
            console.log('Using MOCK email delivery (No credentials found in .env)');
            return res.status(200).json({ 
                message: 'OTP sent successfully (MOCK MODE: 123456)', 
                devOtp: '123456' 
            });
        }

        console.log('Attempting to send real email via Gmail SMTP...');
        try {
            const mailOptions = {
                from: `"Digital Gaon Security" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your 6-Digit OTP Code',
                text: `Welcome! Your verification code is: ${otp}. It will expire in 5 minutes.`
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully! MessageId:', info.messageId);
            res.status(200).json({ message: 'OTP sent successfully to your email' });
        } catch (mailError) {
            console.error('CRITICAL Nodemailer Error:', mailError.message);
            res.status(500).json({ 
                message: 'Failed to send email. Check your Gmail App Password setup.',
                error: mailError.message 
            });
        }
    } catch (error) {
        console.error('General Controller Error:', error.message);
        res.status(500).json({ message: 'Internal server error occurred' });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        if (process.env.DEV_MODE === 'true' && otp === '123456') {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
            return res.status(200).json({ message: 'OTP verified successfully (DEV MODE)', token });
        }

        let otpRecord = null;
        
        try {
            otpRecord = await Otp.findOne({ email, otp });
        } catch (dbError) {
            console.log('DB Find Error (Checking In-Memory Fallback):', dbError.message);
        }

        // Check memory if DB failed or returned nothing
        if (!otpRecord) {
            const cached = otpCache.get(email);
            if (cached && cached.otp === otp && cached.expiresAt > new Date()) {
                otpRecord = cached;
                console.log('OTP verified via In-Memory Cache.');
            }
        }

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP verified, create JWT
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Cleanup
        try {
            await Otp.deleteOne({ email });
        } catch (e) {}
        otpCache.delete(email);

        res.status(200).json({
            message: 'OTP verified successfully',
            token
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};
