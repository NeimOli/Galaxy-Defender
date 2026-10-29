import React from 'react';

export default function TelemetryHUD({
    shield,
    maxShield = 100,
    shieldPct: rawShieldPct,
    lives = 3,
    bombs,
    megaBombs: rawBombs,
    score = 0,
    level = 1,
    user,
    onTriggerBomb
}) {
    const shieldPct = rawShieldPct !== undefined ? rawShieldPct : (shield !== undefined ? (shield / maxShield) * 100 : 100);
    const bombCount = bombs !== undefined ? bombs : (rawBombs !== undefined ? rawBombs : 2);
    const triggerBomb = onTriggerBomb || (() => { if (window.game) window.game.triggerMegaBomb(); });
    return (
        <section className="hud-panel" aria-label="Flight Telemetry">
            {/* Active Pilot Identity */}
            <div className="hud-group" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(0, 240, 255, 0.15)' }}>
                <span className="hud-label">Active Pilot</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: 'rgba(0, 240, 255, 0.12)', border: '1px solid #00f0ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#00f0ff', flexShrink: 0
                    }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {user?.callsign || 'Guest Vanguard'}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#00f0ff', fontWeight: 600 }}>
                            {user?.rank || 'Cadet'} // {user?.shipClass || 'Interceptor'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quantum Shield */}
            <div className="hud-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="hud-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        Quantum Shield
                    </span>
                    <span style={{
                        fontSize: '0.8rem',
                        fontFamily: "'Orbitron', monospace",
                        fontWeight: 800,
                        color: shieldPct < 25 ? '#ff3366' : (shieldPct < 60 ? '#ffb703' : '#00f0ff')
                    }}>
                        {Math.round(shieldPct)}%
                    </span>
                </div>
                <div className="hud-shield-container">
                    <div
                        className={`hud-shield-fill ${shieldPct < 25 ? 'critical' : ''}`}
                        style={{
                            width: `${Math.max(0, Math.min(100, shieldPct))}%`,
                            background: shieldPct < 25
                                ? 'linear-gradient(90deg, #ff3366, #ff0055)'
                                : (shieldPct < 60
                                    ? 'linear-gradient(90deg, #ffb703, #ff8c00)'
                                    : 'linear-gradient(90deg, #00f0ff, #0077ff)'),
                            boxShadow: shieldPct > 0 ? '0 0 8px rgba(0, 240, 255, 0.45)' : 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)' }}>
                    <span>{shieldPct > 0 ? 'FORCEFIELD ONLINE' : 'SHIELD COLLAPSED'}</span>
                    <span>AUTO-REGEN 3s</span>
                </div>
            </div>

            {/* Hull Integrity / Lives */}
            <div className="hud-group">
                <span className="hud-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    Hull Integrity / Lives
                </span>
                <div className="hud-value hud-lives-wrap">
                    {lives > 0 ? (
                        Array.from({ length: lives }).map((_, i) => (
                            <svg key={i} className="life-heart" width="16" height="16" viewBox="0 0 24 24" fill="#00f59b">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        ))
                    ) : (
                        <span style={{ color: '#ff3366', fontSize: '11px', fontWeight: 800 }}>CRITICAL HULL</span>
                    )}
                </div>
            </div>

            {/* Mega Bombs */}
            <div
                className="hud-group"
                style={{
                    cursor: bombCount > 0 ? 'pointer' : 'default',
                    border: bombCount > 0 ? '1px solid rgba(255, 183, 3, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)',
                    background: bombCount > 0 ? 'rgba(255, 183, 3, 0.05)' : 'transparent',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    transition: 'all 0.15s ease'
                }}
                onClick={triggerBomb}
                title="Click or press [B] to Detonate Quantum Mega Bomb"
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="hud-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: bombCount > 0 ? '#ffb703' : 'rgba(255,255,255,0.4)', margin: 0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="9"/>
                            <line x1="12" y1="3" x2="12" y2="7"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                            <line x1="3" y1="12" x2="7" y2="12"/>
                            <line x1="17" y1="12" x2="21" y2="12"/>
                        </svg>
                        Mega Bombs <kbd style={{ background: 'rgba(255,183,3,0.18)', color: '#ffb703', padding: '1px 5px', borderRadius: '3px', fontSize: '0.65rem' }}>[B]</kbd>
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                            fontFamily: "'Orbitron', monospace",
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: bombCount > 0 ? '#ffb703' : '#ff3366'
                        }}>
                            {bombCount}
                        </span>
                        {bombCount > 0 ? (
                            <span style={{
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #ffb703, #ff8c00)',
                                color: '#050814',
                                padding: '2px 7px',
                                borderRadius: '4px',
                                letterSpacing: '0.04em'
                            }}>
                                DETONATE
                            </span>
                        ) : (
                            <span style={{ fontSize: '0.62rem', color: '#ff3366', fontWeight: 600 }}>EMPTY</span>
                        )}
                    </div>
                </div>
                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', marginTop: '4px' }}>
                    {bombCount > 0 ? 'Click to wipe all enemies & bullets' : 'Solve Banana API to restock'}
                </div>
            </div>

            {/* Sector & Combat Score */}
            <div className="hud-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span className="hud-label">Sector</span>
                        <div className="hud-value" style={{ color: 'var(--cyan-primary)' }}>{level}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className="hud-label">Combat Score</span>
                        <div className="hud-value" style={{ color: 'var(--gold-primary)' }}>{score.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </section>
    );
}

