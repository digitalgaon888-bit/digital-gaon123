const nodemailer = require('nodemailer');
const crypto = require('crypto');
const Otp = require('../models/Otp');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to DB (Skip in DEV_MODE)
        if (process.env.DEV_MODE === 'true') {
            console.log('DEV_MODE: Skipping DB save. Logic proceed to "send email" step.');
        } else {
            await Otp.findOneAndUpdate(
                { email },
                { otp, expiresAt },
                { upsert: true, new: true }
            );
        }

        // Send email (Skip in DEV_MODE)
        if (process.env.DEV_MODE === 'true') {
            console.log('DEV_MODE: Skip sending email. OTP is:', otp);
            return res.status(200).json({ message: 'OTP sent successfully (DEV MODE: 123456)', devOtp: '123456' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: 'Failed to send OTP' });
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

        const otpRecord = await Otp.findOne({ email, otp });

        if (!otpRecord) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // OTP verified, create JWT
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Delete OTP after successful verification
        await Otp.deleteOne({ email });

        res.status(200).json({
            message: 'OTP verified successfully',
            token
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    }
};
