const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../database');
const jwt = require('jsonwebtoken');

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
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

        // Save OTP to SQLite (upsert)
        const existing = db.prepare('SELECT * FROM otps WHERE email = ?').get(email);
        if (existing) {
            db.prepare('UPDATE otps SET otp = ?, expiresAt = ? WHERE email = ?').run(otp, expiresAt, email);
        } else {
            db.prepare('INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?)').run(email, otp, expiresAt);
        }
        console.log('OTP saved to SQLite.');

        if (process.env.DEV_MODE === 'true') {
            console.log('DEV_MODE is true. OTP:', otp);
            return res.status(200).json({ 
                message: 'OTP sent successfully (DEV MODE: 123456)', 
                devOtp: '123456' 
            });
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

        const otpRecord = db.prepare('SELECT * FROM otps WHERE email = ? AND otp = ?').get(email, otp);

        if (!otpRecord || new Date(otpRecord.expiresAt) < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP verified, create JWT
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Cleanup
        db.prepare('DELETE FROM otps WHERE email = ?').run(email);

        res.status(200).json({
            message: 'OTP verified successfully',
            token
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};
