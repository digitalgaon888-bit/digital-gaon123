const Dashboard = ({ onLogout }) => {
    return (
        <div className="card" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Dashboard</h1>
                <button onClick={onLogout} style={{ width: 'auto', padding: '0.5rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    Logout
                </button>
            </div>
            
            <div style={{ textAlign: 'left', background: 'rgba(15, 23, 42, 0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                <h3 style={{ marginBottom: '1rem' }}>Welcome Back!</h3>
                <p style={{ margin: 0 }}>You have successfully authenticated with Google and verified your identity through OTP.</p>
                
                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '10px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Session</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Active</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Security</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Verified</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
