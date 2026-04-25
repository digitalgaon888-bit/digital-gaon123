import React, { useState, useEffect } from 'react';
import { LogOut, Menu, Download } from 'lucide-react';

const Header = ({ userName, onLogout, onMenuToggle }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled]       = useState(false);
  const [installMsg,   setInstallMsg]       = useState('');

  useEffect(() => {
    // Already running as installed PWA?
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallMsg('✅ App installed!');
        setIsInstalled(true);
      } else {
        setInstallMsg('');
      }
      setDeferredPrompt(null);
    } else if (!isInstalled) {
      // Fallback: guide user manually
      setInstallMsg('Open in Chrome → Menu (⋮) → "Add to Home screen"');
      setTimeout(() => setInstallMsg(''), 5000);
    }
  };


  return (
    <header className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle Menu">
          <Menu size={24} />
        </button>

        <div style={{
          width: '35px',
          height: '35px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '0.9rem',
          flexShrink: 0
        }}>
          {userName ? userName[0].toUpperCase() : 'U'}
        </div>
        <div style={{ fontWeight: '500' }}>
          Welcome, <span style={{ color: 'var(--primary)' }}>{userName || 'User'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* PWA Install Button — always visible */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={handleInstallClick}
            title={isInstalled ? 'App already installed' : 'Download App'}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: isInstalled
                ? 'rgba(16,185,129,0.1)'
                : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.15))',
              border: isInstalled
                ? '1px solid rgba(16,185,129,0.3)'
                : '1px solid rgba(139,92,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isInstalled ? '#34d399' : 'var(--primary)',
              cursor: isInstalled ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
              boxShadow: isInstalled
                ? '0 4px 12px rgba(16,185,129,0.1)'
                : '0 4px 12px rgba(139,92,246,0.1)'
            }}
            onMouseOver={(e) => {
              if (!isInstalled) {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(139,92,246,0.25)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = isInstalled
                ? '0 4px 12px rgba(16,185,129,0.1)'
                : '0 4px 12px rgba(139,92,246,0.1)';
            }}
          >
            {isInstalled ? '✓' : <Download size={20} />}
          </button>
          {/* Tooltip message */}
          {installMsg && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, whiteSpace: 'nowrap',
              background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '6px 12px', fontSize: '0.75rem',
              color: '#e2e8f0', zIndex: 999, backdropFilter: 'blur(8px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
            }}>
              {installMsg}
            </div>
          )}
        </div>


        <button onClick={onLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LogOut size={16} />
          <span className="hide-mobile">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
