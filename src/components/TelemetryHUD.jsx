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
            {/* Quantum Shield */}
            <div className="hud-group">
                <span className="hud-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Quantum Shield
                </span>
                <div className="hud-shield-container">
                    <div
                        className={`hud-shield-fill ${shieldPct < 25 ? 'critical' : ''}`}
                        style={{ width: `${Math.max(0, Math.min(100, shieldPct))}%` }}
                    />
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
                style={{ cursor: 'pointer' }}
                onClick={triggerBomb}
                title="Tap to Detonate Mega Bomb [B]"
            >
                <span className="hud-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="9"/>
                        <line x1="12" y1="3" x2="12" y2="7"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                        <line x1="3" y1="12" x2="7" y2="12"/>
                        <line x1="17" y1="12" x2="21" y2="12"/>
                    </svg>
                    Mega Bombs <kbd>[B]</kbd>
                </span>
                <div className="hud-value">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--gold-primary)">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    <span>{bombCount}</span>
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

