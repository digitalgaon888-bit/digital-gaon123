import { useState } from 'react';
import axios from 'axios';

const OtpVerify = ({ email, onVerifySuccess }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/verify-otp', { email, otp });
            const { token } = res.data;
            
            // Store JWT token
            localStorage.setItem('token', token);
            onVerifySuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <h2>Verify Security Code</h2>
            <p>We've sent a 6-digit verification code to <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{email}</span>. Please enter it below.</p>
            
            {error && <div className="error">{error}</div>}
            
            <form onSubmit={handleVerify}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        required
                        style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem', fontWeight: '700' }}
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? <div className="spinner"></div> : 'Verify & Continue'}
                </button>
            </form>
            
            <div style={{ marginTop: '2rem' }}>
                <p style={{ fontSize: '0.85rem' }}>
                    Didn't receive the code? <button style={{ display: 'inline', background: 'none', padding: 0, border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', boxShadow: 'none', transform: 'none', width: 'auto' }}>Resend</button>
                </p>
            </div>
        </div>
    );
};

export default OtpVerify;
