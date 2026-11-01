import React from 'react';

const SECTORS = [
    {
        id: 1,
        name: 'Perimeter Outpost',
        code: 'SEC-ALPHA-01',
        threat: 'Low Intensity',
        threatColor: '#00f59b',
        intel: 'Rogue Scout Drones and rogue asteroid fragments patrolling border gates.',
        boss: 'None (Patrol Fleet)'
    },
    {
        id: 2,
        name: 'Crimson Asteroid Belt',
        code: 'SEC-BETA-02',
        threat: 'Moderate Hostility',
        threatColor: '#ffb703',
        intel: 'Crimson Raiders deployed with targeted directed laser systems. Velocity +12%.',
        boss: 'Raider Squadron Leader'
    },
    {
        id: 3,
        name: 'Void Dreadnought Field',
        code: 'SEC-GAMMA-03',
        threat: 'High Danger',
        threatColor: '#ff8c00',
        intel: 'Armored Void Bombers launching triple-cluster homing plasma mines.',
        boss: 'Void Heavy Bomber'
    },
    {
        id: 4,
        name: 'Dreadnought Nexus Core',
        code: 'SEC-DELTA-04',
        threat: 'Critical Encounter',
        threatColor: '#ff0055',
        intel: 'Flagship Mothership Dreadnought with multi-phase radial energy barrages.',
        boss: 'Mothership Dreadnought'
    },
    {
        id: 5,
        name: 'Dark Matter Rift',
        code: 'SEC-EPSILON-05',
        threat: 'Extreme Hazard',
        threatColor: '#ff0033',
        intel: 'Gravitational distortions: rapid enemy spawn intervals and enhanced armor.',
        boss: 'Rift Carrier'
    },
    {
        id: 6,
        name: 'Crimson Armada Nexus',
        code: 'SEC-ZETA-06',
        threat: 'Severe Combat',
        threatColor: '#ff0055',
        intel: 'Full Crimson Fleet attack formation with high-velocity laser ordnance.',
        boss: 'Armada Commander'
    },
    {
        id: 7,
        name: 'Singularity Gate',
        code: 'SEC-ETA-07',
        threat: 'Maximum Alert',
        threatColor: '#e040fb',
        intel: 'Combined hostile forces: heavy bombers, raiders, and splitting mega-asteroids.',
        boss: 'Gate Guardian'
    },
    {
        id: 8,
        name: 'Stellar Omega Dreadnought',
        code: 'SEC-OMEGA-08',
        threat: 'Apocalyptic',
        threatColor: '#ffd700',
        intel: 'Ultimate Dreadnought Nexus. Full bullet-hell spiral plasma spray.',
        boss: 'Omega Nexus Dreadnought'
    }
];

export default function SectorsModal({
    isOpen = true,
    onClose,
    user,
    onSelectSector
}) {
    if (!isOpen) return null;

    const maxSector = Math.max(1, Number(user?.maxSector || 1));
    const currentLevel = Math.max(1, Number(user?.currentLevel || 1));

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content sectors-modal-content" style={{ maxWidth: 'min(94vw, 840px)', maxHeight: '88vh', overflowY: 'auto' }}>
                {/* ── Modal Header ── */}
                <div className="modal-header">
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 215, 0, 0.25))',
                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(0, 240, 255, 0.5)', color: '#00f0ff'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"/>
                                <polyline points="2 17 12 22 22 17"/>
                                <polyline points="2 12 12 17 22 12"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>
                                TACTICAL SECTOR FLIGHT DIRECTORY
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#ffd700', letterSpacing: '0.08em' }}>
                                Pilot: {user?.callsign || 'Pilot'} // Level: LVL {user?.pilotLevel || 1} // Unlocked: {maxSector}/8 Sectors
                            </div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>

                {/* ── Pilot Progress Bar ── */}
                <div style={{
                    margin: '14px 0 16px',
                    padding: '12px 16px',
                    background: 'rgba(5, 8, 20, 0.75)',
                    border: '1px solid rgba(0, 240, 255, 0.25)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            Current Saved Mission Sector
                        </div>
                        <div style={{ fontSize: '1.1rem', fontFamily: "'Orbitron', sans-serif", fontWeight: 800, color: '#00f0ff' }}>
                            Sector {currentLevel}: {SECTORS[currentLevel - 1]?.name || 'Deep Cosmos'}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn btn-launch"
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            onClick={() => {
                                onSelectSector(currentLevel);
                                onClose();
                            }}
                        >
                            CONTINUE SECTOR {currentLevel}
                        </button>
                    </div>
                </div>

                {/* ── Sector Cards Grid ── */}
                <div className="sectors-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    {SECTORS.map((sec) => {
                        const isUnlocked = sec.id <= maxSector;
                        const isCurrent = sec.id === currentLevel;

                        return (
                            <div
                                key={sec.id}
                                className={`sector-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current-sector' : ''}`}
                                style={{
                                    background: isUnlocked
                                        ? (isCurrent ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)')
                                        : 'rgba(15, 20, 35, 0.45)',
                                    border: isCurrent
                                        ? '1.5px solid #00f0ff'
                                        : (isUnlocked ? '1px solid rgba(255, 215, 0, 0.35)' : '1px solid rgba(255, 255, 255, 0.08)'),
                                    borderRadius: '8px',
                                    padding: '14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    transition: 'all 0.2s ease',
                                    opacity: isUnlocked ? 1 : 0.65
                                }}
                            >
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    fontFamily: "'Orbitron', sans-serif",
                                                    fontWeight: 800,
                                                    color: isUnlocked ? '#ffd700' : 'rgba(255,255,255,0.4)'
                                                }}>
                                                    SECTOR {sec.id}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.68rem',
                                                    color: sec.threatColor,
                                                    background: 'rgba(0,0,0,0.4)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    border: `1px solid ${sec.threatColor}44`,
                                                    fontWeight: 700
                                                }}>
                                                    {sec.threat}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginTop: '3px' }}>
                                                {sec.name}
                                            </div>
                                        </div>

                                        {isCurrent && (
                                            <span style={{
                                                fontSize: '0.65rem',
                                                background: '#00f0ff',
                                                color: '#050814',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontFamily: "'Orbitron', sans-serif",
                                                fontWeight: 800
                                            }}>
                                                CURRENT
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.4, marginBottom: '8px' }}>
                                        {sec.intel}
                                    </div>

                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255, 215, 0, 0.75)', marginBottom: '12px' }}>
                                        Hostile Target: <strong>{sec.boss}</strong>
                                    </div>
                                </div>

                                <div>
                                    {isUnlocked ? (
                                        <button
                                            className="btn btn-primary"
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                fontSize: '0.78rem',
                                                fontFamily: "'Orbitron', sans-serif",
                                                fontWeight: 700,
                                                background: isCurrent ? 'linear-gradient(135deg, #00f0ff, #0077ff)' : undefined
                                            }}
                                            onClick={() => {
                                                onSelectSector(sec.id);
                                                onClose();
                                            }}
                                        >
                                            {isCurrent ? `DEPLOY (SECTOR ${sec.id})` : `DEPLOY TO SECTOR ${sec.id}`}
                                        </button>
                                    ) : (
                                        <button
                                            className="btn btn-secondary"
                                            disabled
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                fontSize: '0.75rem',
                                                color: 'rgba(255, 255, 255, 0.4)',
                                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                                cursor: 'not-allowed'
                                            }}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                            LOCKED (CLEAR SECTOR {sec.id - 1})
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

