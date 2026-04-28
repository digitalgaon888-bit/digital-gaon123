import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, CheckCircle2, Clock } from 'lucide-react';
import API_BASE_URL from '../config/api';

const FeatureLock = ({ feature, userEmail, children }) => {
  const [status, setStatus] = useState('loading'); // loading | none | pending | approved
  const [requesting, setRequesting] = useState(false);

  const configs = {
    vyapar: { name: 'Vyapar Saathi', icon: '🛒', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', field: 'vyaparAccess' },
    dairy: { name: 'Dairy Saathi', icon: '🐄', color: '#10b981', bg: 'rgba(16,185,129,0.15)', field: 'dairyAccess' },
    pashu: { name: 'Pashu Saathi', icon: '🩺', color: '#10b981', bg: 'rgba(16,185,129,0.15)', field: 'pashuAccess' },
    yatra: { name: 'Yatra Saathi', icon: '🚕', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', field: 'yatraAccess' },
    hotel: { name: 'Hotel Saathi', icon: '🏨', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', field: 'hotelAccess' },
    agri: { name: 'Agri Saathi', icon: '🚜', color: '#10b981', bg: 'rgba(16,185,129,0.15)', field: 'agriAccess' },
    health: { name: 'Health Saathi', icon: '🏥', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', field: 'healthAccess' }
  };

  const config = configs[feature] || configs.dairy;
  const email = userEmail || localStorage.getItem('userEmail');

  useEffect(() => {
    if (!email) return;
    axios.get(`${API_BASE_URL}/api/access/status?email=${encodeURIComponent(email)}`)
      .then(res => setStatus(res.data[config.field] || 'none'))
      .catch(() => setStatus('none'));
  }, [email, config.field]);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/access/request`, { email, feature });
      setStatus(res.data.status);
    } catch { alert('Request failed. Please try again.'); }
    finally { setRequesting(false); }
  };

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'rgba(255,255,255,0.4)', fontFamily: "'Outfit', sans-serif" }}>
        Loading...
      </div>
    );
  }

  if (status === 'approved') return children;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem', fontFamily: "'Outfit', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '440px', width: '100%' }}>
        {/* Lock Icon */}
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: config.bg, border: `2px solid ${config.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', fontSize: '2.5rem' }}>
          {status === 'pending' ? <Clock size={40} color={config.color} /> : <Lock size={40} color={config.color} />}
        </div>

        {/* Feature Name */}
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{config.icon}</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', margin: '0 0 0.75rem' }}>{config.name}</h2>

        {status === 'none' && (
          <>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              Yeh feature abhi aapke liye <strong style={{ color: '#fff' }}>locked</strong> hai.<br />
              Admin se access maangne ke liye neeche button dabayein.
            </p>
            <button
              onClick={handleRequest}
              disabled={requesting}
              style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`, color: '#fff', border: 'none', padding: '1rem 2.5rem', borderRadius: '14px', fontSize: '1rem', fontWeight: '700', cursor: requesting ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", boxShadow: `0 8px 24px ${config.color}40`, transition: 'all 0.2s', opacity: requesting ? 0.7 : 1 }}
            >
              {requesting ? '⏳ Request bhej rahe hain...' : '🔓 Access Request Karo'}
            </button>
          </>
        )}

        {status === 'pending' && (
          <>
            <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '14px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ color: '#fbbf24', fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem' }}>⏳ Request Pending</div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', margin: 0, lineHeight: '1.6' }}>
                Aapki request admin ko mil gayi hai.<br />
                Admin approve karte hi yeh feature khul jayega!
              </p>
            </div>
            <button
              disabled
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.9rem 2rem', borderRadius: '14px', fontSize: '0.95rem', fontWeight: '600', cursor: 'not-allowed', fontFamily: "'Outfit', sans-serif" }}
            >
              <Clock size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
              Admin Approval Ka Wait Kar Rahe Hain...
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FeatureLock;
