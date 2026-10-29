import React, { useState, useEffect } from 'react';
import API from '../services/api';

export default function LeaderboardModal({ isOpen = true, onClose, user, onLaunchMission }) {
    const [tab, setTab] = useState('global'); // 'global' | 'personal'
    const [globalScores, setGlobalScores] = useState([]);
    const [personalScores, setPersonalScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterShip, setFilterShip] = useState('ALL');

    const currentUser = user || API.getCurrentUser();

    useEffect(() => {
        if (isOpen) {
            loadRecords();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, currentUser?.id]);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const all = await API.getLeaderboard();
            setGlobalScores(all || []);

            if (currentUser && currentUser.id) {
                const myRecords = await API.getUserRecords(currentUser.id);
                setPersonalScores(myRecords || []);
            } else {
                setPersonalScores((all || []).filter(s => !s.user_id));
            }
        } catch (err) {
            console.warn('[RECORDS] Error loading telemetry:', err);
        } finally {
            setLoading(false);
        }
    };

    if (isOpen === false) return null;

    const activeList = tab === 'global' ? globalScores : personalScores;

    const filteredList = activeList.filter(item => {
        const matchesSearch = !searchQuery.trim() ||
            (item.pilot_name && item.pilot_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.username && item.username.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesShip = filterShip === 'ALL' ||
            (item.ship_class && item.ship_class.toLowerCase() === filterShip.toLowerCase());
        return matchesSearch && matchesShip;
    });

    const topScore = globalScores.length > 0 ? Math.max(...globalScores.map(s => Number(s.score) || 0)) : 0;
    const totalBananaSolved = globalScores.reduce((acc, s) => acc + (Number(s.banana_puzzles_completed) || 0), 0);
    const avgAccuracy = globalScores.length > 0
        ? (globalScores.reduce((acc, s) => acc + (Number(s.accuracy_percentage) || 0), 0) / globalScores.length).toFixed(1)
        : 0;

    // Medal SVG icons for top 3
    const medalIcon = (n) => {
        const colors = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill={colors[n]} style={{ verticalAlign: 'middle', marginRight: '2px' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        );
    };

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-content records-modal-card">

                {/* ── Header ── */}
                <div className="modal-header">
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, #00f0ff, #0077ff)',
                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050814" strokeWidth="2.2">
                                <path d="M6 9H3a2 2 0 01-2-2V5a2 2 0 012-2h3m12 6h3a2 2 0 002-2V5a2 2 0 00-2-2h-3M6 3h12v7a6 6 0 01-12 0V3z"/>
                                <path d="M9 21h6m-3-6v6"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>
                                TACTICAL FLIGHT RECORDS &amp; TELEMETRY
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(0, 240, 255, 0.7)', letterSpacing: '0.08em' }}>
                                SQLite Relational Store // Mission Sorties Database
                            </div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>

                {/* ── Pilot identity banner ── */}
                <div className="records-pilot-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            background: 'rgba(0,240,255,0.10)', border: '1px solid #00f0ff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#00f0ff">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Active Pilot Identity
                            </div>
                            <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>
                                {currentUser?.callsign || 'Guest Vanguard'}
                                <span style={{ color: '#00f0ff', fontSize: '0.75rem', fontWeight: 600, marginLeft: '6px' }}>
                                    ({currentUser?.rank || 'Cadet'})
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div className="banner-stat">
                            <span className="b-label">Career Score</span>
                            <span className="b-val" style={{ color: '#00f0ff' }}>{(currentUser?.totalScore || 0).toLocaleString()}</span>
                        </div>
                        <div className="banner-stat">
                            <span className="b-label">Sorties</span>
                            <span className="b-val">{currentUser?.gamesPlayed || personalScores.length || 0}</span>
                        </div>
                        <div className="banner-stat">
                            <span className="b-label">Banana Ciphers</span>
                            <span className="b-val" style={{ color: '#ffb703' }}>{currentUser?.bananaSolved || 0}</span>
                        </div>
                        <div className="banner-stat">
                            <span className="b-label">Vessel</span>
                            <span className="b-val" style={{ color: '#a855f7' }}>{currentUser?.shipClass || 'Interceptor'}</span>
                        </div>
                    </div>
                </div>

                {/* ── Quick stats grid ── */}
                <div className="records-stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Top Sector Score</div>
                        <div className="stat-num" style={{ color: '#ffb703' }}>{topScore.toLocaleString()}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Fleet Accuracy Avg</div>
                        <div className="stat-num" style={{ color: '#00f59b' }}>{avgAccuracy}%</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Banana API Solved</div>
                        <div className="stat-num" style={{ color: '#00f0ff' }}>{totalBananaSolved}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Database Engine</div>
                        <div className="stat-num" style={{ fontSize: '0.85rem', color: '#a855f7' }}>SQLite 3 WAL</div>
                    </div>
                </div>

                {/* ── Tabs + filter bar ── */}
                <div className="records-toolbar">
                    <div className="records-tabs">
                        <button
                            className={`tab-btn${tab === 'global' ? ' active' : ''}`}
                            onClick={() => setTab('global')}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="2" y1="12" x2="22" y2="12"/>
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            Fleet Hall of Fame ({globalScores.length})
                        </button>
                        <button
                            className={`tab-btn${tab === 'personal' ? ' active' : ''}`}
                            onClick={() => setTab('personal')}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            My Flight Log ({personalScores.length})
                        </button>
                    </div>

                    <div className="records-filters">
                        <input
                            type="text"
                            placeholder="Search pilot..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="records-search-input"
                        />
                        <select
                            value={filterShip}
                            onChange={(e) => setFilterShip(e.target.value)}
                            className="records-ship-select"
                        >
                            <option value="ALL">All Vessels</option>
                            <option value="Interceptor">Interceptor</option>
                            <option value="Dreadnought">Dreadnought</option>
                            <option value="Phantom Recon">Phantom Recon</option>
                            <option value="Titan Heavy">Titan Heavy</option>
                            <option value="Strike Fighter">Strike Fighter</option>
                        </select>
                        <button
                            className="records-refresh-btn"
                            onClick={loadRecords}
                            title="Refresh records from SQLite"
                            aria-label="Refresh"
                        >
                            <svg
                                width="14" height="14" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2"
                                className={loading ? 'spin' : ''}
                            >
                                <polyline points="23 4 23 10 17 10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="table-responsive-container">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="loader-spinner" style={{ margin: '0 auto 12px' }} />
                            <div style={{ color: 'var(--cyan)', fontSize: '13px', fontWeight: 600 }}>
                                Querying SQLite Telemetry Store...
                            </div>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="records-empty-state">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" style={{ marginBottom: '10px' }}>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            <div style={{ color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
                                No mission telemetry records found.
                            </div>
                            <div style={{ fontSize: '0.8rem' }}>
                                {tab === 'personal'
                                    ? 'Deploy a combat sortie to record your flight telemetry!'
                                    : 'No records match your filter criteria.'}
                            </div>
                        </div>
                    ) : (
                        <table className="telemetry-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                                    <th>Pilot Callsign</th>
                                    <th>Vessel Class</th>
                                    <th>Mil. Rank</th>
                                    <th style={{ textAlign: 'right' }}>Combat Score</th>
                                    <th style={{ textAlign: 'center' }}>Sector</th>
                                    <th style={{ textAlign: 'center' }}>Kills</th>
                                    <th style={{ textAlign: 'center' }}>Banana Ciphers</th>
                                    <th style={{ textAlign: 'right' }}>Accuracy</th>
                                    <th style={{ textAlign: 'right' }}>Recorded At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.map((item, idx) => {
                                    const isCurrentPilot = currentUser?.id && item.user_id === currentUser.id;
                                    const rankNum = idx + 1;
                                    const isTop1 = rankNum === 1 && tab === 'global';
                                    const isTop2 = rankNum === 2 && tab === 'global';
                                    const isTop3 = rankNum === 3 && tab === 'global';

                                    return (
                                        <tr
                                            key={item.id || idx}
                                            className={`table-row${isCurrentPilot ? ' my-flight-row' : ''}`}
                                        >
                                            {/* Rank / Medal */}
                                            <td style={{ textAlign: 'center' }}>
                                                {isTop1 ? (
                                                    <span className="rank-badge rank-1">{medalIcon(1)} 1</span>
                                                ) : isTop2 ? (
                                                    <span className="rank-badge rank-2">{medalIcon(2)} 2</span>
                                                ) : isTop3 ? (
                                                    <span className="rank-badge rank-3">{medalIcon(3)} 3</span>
                                                ) : (
                                                    <span className="rank-badge">{rankNum}</span>
                                                )}
                                            </td>

                                            {/* Pilot name + avatar */}
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div className="table-avatar">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                                            <circle cx="12" cy="7" r="4"/>
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: isCurrentPilot ? '#00f0ff' : '#fff' }}>
                                                            {item.pilot_name}
                                                        </span>
                                                        {isCurrentPilot && (
                                                            <span className="you-pill">YOU</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Vessel class */}
                                            <td>
                                                <span className="ship-badge">
                                                    {item.ship_class || 'Interceptor'}
                                                </span>
                                            </td>

                                            {/* Rank */}
                                            <td>
                                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem' }}>
                                                    {item.rank || 'Cadet'}
                                                </span>
                                            </td>

                                            {/* Score */}
                                            <td style={{ textAlign: 'right' }}>
                                                <span className="table-score-digit">
                                                    {Number(item.score).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Sector */}
                                            <td style={{ textAlign: 'center' }}>
                                                <span className="sector-tag">SEC-{item.level_reached}</span>
                                            </td>

                                            {/* Kills */}
                                            <td style={{ textAlign: 'center', color: '#ff3366', fontWeight: 700 }}>
                                                {item.enemies_destroyed}
                                            </td>

                                            {/* Banana ciphers */}
                                            <td style={{ textAlign: 'center', color: '#ffb703', fontWeight: 700 }}>
                                                {item.banana_puzzles_completed || 0}
                                            </td>

                                            {/* Accuracy */}
                                            <td style={{
                                                textAlign: 'right',
                                                fontWeight: 600,
                                                color: (item.accuracy_percentage || 0) >= 80 ? '#00f59b' : 'rgba(255,255,255,0.7)'
                                            }}>
                                                {Number(item.accuracy_percentage || 0).toFixed(1)}%
                                            </td>

                                            {/* Timestamp */}
                                            <td style={{
                                                textAlign: 'right',
                                                fontSize: '0.72rem',
                                                color: 'rgba(255,255,255,0.4)',
                                                fontFamily: 'monospace'
                                            }}>
                                                {item.recorded_at ? item.recorded_at.substring(0, 16) : 'Just Now'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="records-footer">
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                        {filteredList.length} sortie{filteredList.length !== 1 ? 's' : ''} retrieved from SQLite
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {onLaunchMission && (
                            <button
                                className="btn btn-primary"
                                onClick={() => { onClose(); onLaunchMission(); }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '5px' }}>
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                Deploy New Mission
                            </button>
                        )}
                        <button className="btn btn-secondary" onClick={onClose}>
                            Dismiss
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
