import React, { useState, useEffect } from 'react';

export default function Navbar({
    user,
    onOpenProfile,
    onOpenBanana,
    onOpenLeaderboard,
    onOpenTests,
    soundMuted,
    onToggleSound,
    onSoundToggle
}) {
    const handleToggleSound = onToggleSound || onSoundToggle;
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        const target = document.querySelector('.game-wrapper') || document.documentElement;
        if (!document.fullscreenElement) {
            if (target.requestFullscreen) target.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <header className="top-navbar">
            <div className="brand-section">
                <div className="brand-logo-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                        <path d="M12 11v7"/>
                    </svg>
                </div>
                <div>
                    <h1 className="brand-title">Galaxy Defender</h1>
                    <div className="brand-subtitle">Tactical Deep Space Defense</div>
                </div>
            </div>

            <div className="nav-actions">
                {/* Pilot Identity Badge */}
                <div
                    className="pilot-badge-pill"
                    onClick={onOpenProfile}
                    title="View Pilot Dossier & Flight Credentials"
                >
                    <div className={`pilot-avatar-badge ${user.avatar || 'pilot_1'}`}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2a9 9 0 00-9 9c0 3.6 2.1 6.7 5.2 8.1V22h7.6v-2.9c3.1-1.4 5.2-4.5 5.2-8.1a9 9 0 00-9-9zm0 4a5 5 0 015 5c0 1.2-.4 2.3-1.1 3.2L12 11.5l-3.9 2.7c-.7-.9-1.1-2-1.1-3.2a5 5 0 015-5z"/>
                        </svg>
                    </div>
                    <div className="pilot-info-text">
                        <span className="pilot-callsign">{user.callsign || 'Guest Vanguard'}</span>
                        <span className="pilot-rank">{user.rank || 'Cadet'}</span>
                    </div>
                </div>

                {/* Banana API Interoperability Trigger */}
                <button
                    className="btn btn-banana"
                    onClick={onOpenBanana}
                    title="Solve Dr. Marc Conrad's Banana API Challenge"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span>Banana API</span>
                </button>

                {/* Leaderboard / Records */}
                <button
                    className="btn btn-secondary"
                    onClick={onOpenLeaderboard}
                    title="View High Aces & Fleet Records"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H3a2 2 0 01-2-2V5a2 2 0 012-2h3m12 6h3a2 2 0 002-2V5a2 2 0 00-2-2h-3M6 3h12v7a6 6 0 01-12 0V3z"/>
                        <path d="M9 21h6m-3-6v6"/>
                    </svg>
                    <span>Records</span>
                </button>

                {/* Diagnostics Test Suite */}
                <button
                    className="btn btn-secondary"
                    onClick={onOpenTests}
                    title="Run System Diagnostics & Test Matrix"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    <span>Diagnostics</span>
                </button>

                {/* Audio Synthesizer Toggle */}
                <button
                    className={`btn btn-secondary ${soundMuted ? 'muted' : ''}`}
                    onClick={handleToggleSound}
                    title="Toggle Synthesized Audio [M]"
                    style={{
                        borderColor: soundMuted ? 'rgba(255, 51, 102, 0.45)' : 'rgba(0, 245, 155, 0.45)',
                        background: soundMuted ? 'rgba(255, 51, 102, 0.08)' : 'rgba(0, 245, 155, 0.08)'
                    }}
                >
                    {soundMuted ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3366" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                                <line x1="23" y1="9" x2="17" y2="15"/>
                                <line x1="17" y1="9" x2="23" y2="15"/>
                            </svg>
                            <span style={{ color: '#ff3366', fontWeight: 800 }}>Audio MUTED</span>
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00f59b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
                            </svg>
                            <span style={{ color: '#00f59b', fontWeight: 800 }}>Audio ON</span>
                        </>
                    )}
                </button>

                {/* Fullscreen Immersion Mode Toggle */}
                <button
                    className="btn btn-secondary"
                    onClick={toggleFullscreen}
                    title="Toggle Fullscreen Immersion [F]"
                >
                    {isFullscreen ? (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7"/>
                            </svg>
                            <span>Windowed</span>
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                            </svg>
                            <span>Fullscreen</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    );
}

