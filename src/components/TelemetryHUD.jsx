import React from 'react';

/**
 * TelemetryHUD.jsx — Tactical Flight Telemetry System
 * High-visibility cockpit HUD featuring:
 * - Active Pilot Identity & Callsign
 * - Quantum Shield Forcefield with percentage readout & auto-regen telemetry
 * - Hull Integrity segmented armor tracking (Gold / Yellow / Crimson status)
 * - Quantum Mega Bombs quick-detonate module with [B] shortcut
 * - Sector & Combat Score real-time telemetry
 */
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
    const shieldPct = rawShieldPct !== undefined
        ? rawShieldPct
        : (shield !== undefined ? Math.max(0, Math.min(100, (shield / maxShield) * 100)) : 100);
    const bombCount = bombs !== undefined ? bombs : (rawBombs !== undefined ? rawBombs : 2);
    const triggerBomb = onTriggerBomb || (() => {
        if (window.game) window.game.triggerMegaBomb();
    });

    // Hull integrity condition
    const maxLives = 3;
    const currentLives = Math.max(0, Math.min(maxLives, lives));

    const getHullStatus = () => {
        if (currentLives >= 3) return { label: 'OPTIMAL', color: '#ffd700', bg: 'rgba(255, 215, 0, 0.15)' };
        if (currentLives === 2) return { label: 'MODERATE', color: '#ffb703', bg: 'rgba(255, 183, 3, 0.15)' };
        if (currentLives === 1) return { label: 'CRITICAL', color: '#ff3366', bg: 'rgba(255, 51, 102, 0.2)' };
        return { label: 'BREACHED', color: '#ff0033', bg: 'rgba(255, 0, 51, 0.3)' };
    };

    const hullStatus = getHullStatus();

    // Shield status styling (Gold / Amber / Crimson)
    const getShieldColor = () => {
        if (shieldPct > 60) return '#ffd700'; // High Gold
        if (shieldPct > 25) return '#ffb703'; // Amber
        return '#ff3366'; // Critical Red
    };

    const shieldColor = getShieldColor();

    return (
        <aside className="hud-panel" aria-label="Flight Telemetry">
            {/* 1. Active Pilot Identity */}
            <div className="hud-group hud-pilot-group">
                <span className="hud-label">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffd700">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Active Pilot
                </span>
                <div className="hud-pilot-row">
                    <div className="hud-pilot-avatar">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                    </div>
                    <div className="hud-pilot-info">
                        <div className="hud-pilot-name" title={user?.callsign || 'Guest Vanguard'}>
                            {user?.callsign || 'Guest Vanguard'}
                        </div>
                        <div className="hud-pilot-meta">
                            <span className="hud-pilot-rank">{user?.rank || 'Cadet'}</span>
                            <span className="hud-pilot-sep">//</span>
                            <span className="hud-pilot-ship">{user?.shipClass || 'Interceptor'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Quantum Shield Forcefield */}
            <div className="hud-group hud-shield-group">
                <div className="hud-group-header">
                    <span className="hud-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={shieldColor} strokeWidth="2.2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        </svg>
                        Quantum Shield
                    </span>
                    <span className="hud-pct-readout" style={{ color: shieldColor }}>
                        {Math.round(shieldPct)}%
                    </span>
                </div>
                <div className="hud-shield-container">
                    <div
                        className={`hud-shield-fill ${shieldPct < 25 ? 'critical' : ''}`}
                        style={{
                            width: `${shieldPct}%`,
                            background: shieldPct < 25
                                ? 'linear-gradient(90deg, #ff0055, #ff3366)'
                                : (shieldPct < 60
                                    ? 'linear-gradient(90deg, #ff8c00, #ffb703)'
                                    : 'linear-gradient(90deg, #ffb703, #ffd700)'),
                            boxShadow: shieldPct > 0 ? `0 0 10px ${shieldColor}66` : 'none'
                        }}
                    />
                </div>
                <div className="hud-sub-status">
                    <span style={{ color: shieldPct > 0 ? '#ffd700' : '#ff3366', fontWeight: 700 }}>
                        {shieldPct > 0 ? 'DEFLECTOR ACTIVE' : 'SHIELD COLLAPSED'}
                    </span>
                    <span>REGEN 3s</span>
                </div>
            </div>

            {/* 3. Hull Integrity / Armor Segments */}
            <div className="hud-group hud-hull-group">
                <div className="hud-group-header">
                    <span className="hud-label">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#ffd700">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        Hull Integrity
                    </span>
                    <span
                        className="hud-status-badge"
                        style={{ color: hullStatus.color, backgroundColor: hullStatus.bg }}
                    >
                        {hullStatus.label}
                    </span>
                </div>

                {/* 3 High-Visibility Hull Segment Blocks */}
                <div className="hud-hull-segments" role="progressbar" aria-label="Hull Lives">
                    {[1, 2, 3].map((segIndex) => {
                        const isIntact = segIndex <= currentLives;
                        return (
                            <div
                                key={segIndex}
                                className={`hull-segment ${isIntact ? 'intact' : 'damaged'}`}
                                title={`Hull Cell ${segIndex}: ${isIntact ? 'Intact' : 'Breached'}`}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill={isIntact ? '#ffd700' : 'rgba(255,255,255,0.15)'}>
                                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                                </svg>
                                <span className="hull-seg-number">{segIndex}</span>
                            </div>
                        );
                    })}
                </div>
                <div className="hud-sub-status">
                    <span>{currentLives} OF {maxLives} CELLS INTACT</span>
                    <span style={{ color: hullStatus.color }}>{currentLives > 0 ? `${currentLives} LIVES` : 'LOST'}</span>
                </div>
            </div>

            {/* 4. Quantum Mega Bombs */}
            <div
                className={`hud-group hud-bomb-group ${bombCount > 0 ? 'armed' : 'disarmed'}`}
                onClick={triggerBomb}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerBomb(); }}
                title="Press [B] or Click to Detonate Mega Bomb"
            >
                <div className="hud-group-header">
                    <span className="hud-label" style={{ color: bombCount > 0 ? '#ffd700' : 'rgba(255,255,255,0.4)' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="12" r="9"/>
                            <line x1="12" y1="3" x2="12" y2="7"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                            <line x1="3" y1="12" x2="7" y2="12"/>
                            <line x1="17" y1="12" x2="21" y2="12"/>
                        </svg>
                        Mega Bombs
                    </span>
                    <kbd className="hud-key-hint">[B]</kbd>
                </div>
                <div className="hud-bomb-action-row">
                    <div className="hud-bomb-count-badge" style={{ color: bombCount > 0 ? '#ffd700' : '#ff3366' }}>
                        &times;{bombCount}
                    </div>
                    {bombCount > 0 ? (
                        <button type="button" className="hud-btn-detonate" onClick={(e) => { e.stopPropagation(); triggerBomb(); }}>
                            DETONATE
                        </button>
                    ) : (
                        <span className="hud-bomb-empty">SOLVE BANANA</span>
                    )}
                </div>
                <div className="hud-sub-status">
                    <span>{bombCount > 0 ? 'SCREEN WIPEOUT READY' : 'EMPTY // SOLVE CIPHER'}</span>
                </div>
            </div>

            {/* 5. Sector & Combat Score */}
            <div className="hud-group hud-score-group">
                <div className="hud-score-row">
                    <div>
                        <span className="hud-label">Sector</span>
                        <div className="hud-sector-val">{level}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span className="hud-label">Combat Score</span>
                        <div className="hud-score-val">{score.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
