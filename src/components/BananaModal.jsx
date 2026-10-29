import React, { useState, useEffect } from 'react';
import { API } from '../services/api';

export default function BananaModal({ isOpen = true, onClose, onSolve, onSolveSuccess }) {
    const handleSolveSuccess = onSolve || onSolveSuccess || (() => {});
    const [loading, setLoading] = useState(true);
    const [puzzleData, setPuzzleData] = useState(null);
    const [imgFailed, setImgFailed] = useState(false);
    const [statusText, setStatusText] = useState('Interfacing with Dr. Marc Conrad Banana API Gateway...');
    const [statusColor, setStatusColor] = useState('var(--cyan)');
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadPuzzle();
        }
    }, [isOpen]);

    const loadPuzzle = async () => {
        setLoading(true);
        setImgFailed(false);
        setSolved(false);
        setStatusText('Contacting https://marcconrad.com/uob/banana/api.php?out=json...');
        setStatusColor('var(--cyan)');

        try {
            const data = await API.fetchBananaPuzzle();
            setPuzzleData(data);
            setLoading(false);
            setStatusText('Live cipher loaded. Calculate the value of the missing symbol [0 - 9]:');
        } catch (err) {
            setLoading(false);
            setStatusText('API Gateway connection error. Local procedural backup active.');
            setStatusColor('var(--amber)');
        }
    };

    const handleAnswer = (digit) => {
        if (!puzzleData || typeof puzzleData.solution === 'undefined' || solved) return;

        const isCorrect = Number(digit) === Number(puzzleData.solution);

        if (isCorrect) {
            setSolved(true);
            setStatusText(`CORRECT! Solution (${digit}) verified by Banana API Gateway. +1,500 Score & Shields Overcharged!`);
            setStatusColor('#00f59b');
            setTimeout(() => {
                handleSolveSuccess();
                onClose();
            }, 1400);
        } else {
            setStatusText(`INCORRECT: Value '${digit}' rejected. Recalculate the visual equation.`);
            setStatusColor('#ff3366');
        }
    };

    if (isOpen === false) return null;

    const puzzleUrl = puzzleData?.question;
    const isSimulated = !puzzleUrl || puzzleUrl === 'SIMULATED_BANANA_PUZZLE' || imgFailed;

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="modal-content" style={{ maxWidth: '520px' }}>

                {/* ── Header ── */}
                <div className="modal-header">
                    <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '36px', height: '36px',
                            background: 'linear-gradient(135deg, #ffb703, #ff8c00)',
                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#050814'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                        </div>
                        <div>
                            <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '0.98rem', fontWeight: 800, color: '#fff', letterSpacing: '0.06em' }}>
                                DR. MARC CONRAD'S BANANA API
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#ffb703', letterSpacing: '0.08em' }}>
                                Interoperability Gateway // Live REST API
                            </div>
                        </div>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>

                <div className="banana-challenge-body" style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '12px', lineHeight: 1.5, textAlign: 'center' }}>
                        This module demonstrates <strong>Interoperability</strong> by integrating the external <strong>Dr. Marc Conrad Banana API</strong>.
                        Decode the arithmetic equation below to earn <strong>+1,500 Score</strong>, max shields, and +1 Mega Bomb.
                    </p>

                    {/* ── Puzzle Image Wrapper ── */}
                    <div className="banana-puzzle-wrapper" style={{
                        width: '100%',
                        minHeight: '160px',
                        background: 'rgba(5, 8, 20, 0.95)',
                        border: '1px solid rgba(255, 183, 3, 0.35)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px',
                        position: 'relative',
                        boxShadow: 'inset 0 0 20px rgba(255, 183, 3, 0.05)'
                    }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                <div className="loader-spinner" style={{ margin: '0 auto 10px', width: '30px', height: '30px', borderColor: '#ffb703' }} />
                                <div style={{ color: '#ffb703', fontSize: '0.8rem', fontWeight: 600 }}>
                                    Fetching puzzle from marcconrad.com...
                                </div>
                            </div>
                        ) : !isSimulated ? (
                            <img
                                className="banana-puzzle-img"
                                alt="Dr. Marc Conrad Banana API Challenge"
                                src={puzzleUrl}
                                onError={() => setImgFailed(true)}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '180px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    display: 'block'
                                }}
                            />
                        ) : (
                            <div style={{ padding: '24px 16px', color: '#ffb703', textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px', letterSpacing: '0.06em' }}>
                                    MATHEMATICAL CIPHER EQUATION
                                </div>
                                <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#fff', background: 'rgba(255,183,3,0.1)', padding: '10px 20px', borderRadius: '6px', border: '1px dashed rgba(255,183,3,0.3)' }}>
                                    (4 &times; 2) + ? = 10
                                </div>
                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: '8px' }}>
                                    Procedural fallback puzzle active
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Status Message ── */}
                    <div style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        margin: '12px 0 10px',
                        color: statusColor,
                        minHeight: '22px',
                        textAlign: 'center'
                    }}>
                        {statusText}
                    </div>

                    {/* ── 0 - 9 Digit Keypad ── */}
                    <div className="banana-keypad" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '8px',
                        width: '100%',
                        maxWidth: '420px',
                        margin: '0 auto'
                    }}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                            <button
                                key={digit}
                                className="keypad-btn"
                                onClick={() => handleAnswer(digit)}
                                disabled={loading || solved}
                                style={{
                                    padding: '12px 0',
                                    fontSize: '1.1rem',
                                    fontFamily: "'Orbitron', monospace",
                                    fontWeight: 800,
                                    background: 'rgba(255, 183, 3, 0.08)',
                                    border: '1px solid rgba(255, 183, 3, 0.25)',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    cursor: (loading || solved) ? 'default' : 'pointer',
                                    transition: 'all 0.15s ease'
                                }}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>

                    {/* ── Controls & Telemetry Source Footer ── */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.72rem',
                        color: 'rgba(255, 255, 255, 0.45)',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                                display: 'inline-block',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#00f59b'
                            }} />
                            <span>API Provider: <strong>{puzzleData?.provider || 'marcconrad.com'}</strong></span>
                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                            onClick={loadPuzzle}
                            disabled={loading || solved}
                            title="Fetch a fresh puzzle from the Banana API"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                            New Puzzle
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
