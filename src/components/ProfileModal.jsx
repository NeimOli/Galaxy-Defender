import React from 'react';

export default function ProfileModal({
    isOpen = true,
    onClose,
    user,
    onLogin,
    onOpenLogin,
    onRegister,
    onOpenRegister,
    onOpenRecords,
    onLogout
}) {
    const handleLogin = onLogin || onOpenLogin;
    const handleRegister = onRegister || onOpenRegister;

    if (isOpen === false) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content" style={{ textAlign: 'center' }}>
                <div className="modal-header">
                    <div className="modal-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="16" rx="2"/>
                            <circle cx="9" cy="10" r="2"/>
                            <path d="M15 8h2m-2 4h2M6 16c0-1.5 1.5-2 3-2s3 .5 3 2m3 0h2"/>
                        </svg>
                        <span>PILOT COMMAND DOSSIER</span>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>

                <div className={`pilot-avatar-large ${user.avatar || 'pilot_1'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--cyan)' }}>
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a9 9 0 00-9 9c0 3.6 2.1 6.7 5.2 8.1V22h7.6v-2.9c3.1-1.4 5.2-4.5 5.2-8.1a9 9 0 00-9-9zm0 4a5 5 0 015 5c0 1.2-.4 2.3-1.1 3.2L12 11.5l-3.9 2.7c-.7-.9-1.1-2-1.1-3.2a5 5 0 015-5z"/>
                    </svg>
                </div>

                <h3 style={{ fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '2px', fontSize: '18px' }}>
                    {user.callsign || 'Guest Vanguard'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--cyan-primary)', marginBottom: '16px' }}>
                    @{user.username || 'guest_pilot'}
                </p>

                <div className="stats-grid" style={{ margin: '0 auto 20px' }}>
                    <div className="stat-box">
                        <div className="hud-label">Military Rank</div>
                        <div className="stat-val" style={{ fontSize: '14px', color: 'var(--cyan-primary)' }}>{user.rank || 'Cadet'}</div>
                    </div>
                    <div className="stat-box">
                        <div className="hud-label">Ship Class</div>
                        <div className="stat-val" style={{ fontSize: '14px' }}>{user.shipClass || 'Interceptor'}</div>
                    </div>
                    <div className="stat-box">
                        <div className="hud-label">Career Score</div>
                        <div className="stat-val" style={{ fontSize: '14px' }}>{Number(user.totalScore || 0).toLocaleString()}</div>
                    </div>
                    <div className="stat-box">
                        <div className="hud-label">Missions</div>
                        <div className="stat-val" style={{ fontSize: '14px' }}>{user.gamesPlayed || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="hud-label">Ciphers Solved</div>
                        <div className="stat-val" style={{ fontSize: '14px', color: 'var(--gold-primary)' }}>{user.bananaSolved || 0}</div>
                    </div>
                    <div className="stat-box">
                        <div className="hud-label">Security Protocol</div>
                        <div className="stat-val" style={{ fontSize: '12px', color: 'var(--emerald-primary)' }}>VERIFIED</div>
                    </div>
                </div>

                {onOpenRecords && (
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', marginBottom: '10px', borderColor: 'var(--cyan)', color: 'var(--cyan)' }}
                        onClick={() => {
                            onClose();
                            onOpenRecords();
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9H3a2 2 0 01-2-2V5a2 2 0 012-2h3m12 6h3a2 2 0 002-2V5a2 2 0 00-2-2h-3M6 3h12v7a6 6 0 01-12 0V3z"/>
                            <path d="M9 21h6m-3-6v6"/>
                        </svg>
                        View Full Telemetry & Records Table
                    </button>
                )}

                {user.isGuest ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleLogin}>
                            Authorize Login
                        </button>
                        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleRegister}>
                            Commission Pilot
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-secondary" style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ff6b81' }} onClick={onLogout}>
                        Log Out (Revert to Guest)
                    </button>
                )}
            </div>
        </div>
    );
}

