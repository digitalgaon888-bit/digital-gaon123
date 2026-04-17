import React from 'react';
import { LogOut, Menu } from 'lucide-react';

const Header = ({ userName, onLogout, onMenuToggle }) => {
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

      <button onClick={onLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <LogOut size={16} />
        <span className="hide-mobile">Logout</span>
      </button>
    </header>
  );
};

export default Header;
