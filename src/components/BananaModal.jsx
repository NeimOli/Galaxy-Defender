import React, { useState, useEffect } from 'react';
import { API } from '../services/api';

export default function BananaModal({ isOpen = true, onClose, onSolve, onSolveSuccess }) {
    const handleSolveSuccess = onSolve || onSolveSuccess || (() => {});
    const [loading, setLoading] = useState(true);
    const [puzzleData, setPuzzleData] = useState(null);
    const [statusText, setStatusText] = useState('Connecting to Banana API Gateway...');
    const [statusColor, setStatusColor] = useState('var(--cyan)');

    useEffect(() => {
        if (isOpen) {
            loadPuzzle();
        }
    }, [isOpen]);

    const loadPuzzle = async () => {
        setLoading(true);
        setStatusText('Connecting to Banana API Gateway...');
        setStatusColor('var(--cyan)');

        const data = await API.fetchBananaPuzzle();
        setPuzzleData(data);
        setLoading(false);
        setStatusText('Visual cipher loaded. Identify the missing numeric value [0 - 9]:');
    };

    const handleAnswer = (digit) => {
        if (!puzzleData || typeof puzzleData.solution === 'undefined') return;

        if (digit === puzzleData.solution) {
            setStatusText(`CIPHER VERIFIED! Solution (${digit}) confirmed. Supercharging systems!`);
            setStatusColor('var(--emerald-primary)');
            setTimeout(() => {
                handleSolveSuccess();
                onClose();
            }, 1200);
        } else {
            setStatusText(`SECURITY REJECTION: Solution '${digit}' is incorrect. Re-examine the equation.`);
            setStatusColor('var(--crimson-primary)');
        }
    };

    if (isOpen === false) return null;

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="14" width="7" height="7" rx="1"/>
                            <rect x="3" y="14" width="7" height="7" rx="1"/>
                        </svg>
                        <span>QUANTUM CIPHER MATRIX</span>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>

                <div className="banana-challenge-body">
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Interfacing with <strong>Dr. Marc Conrad's external Banana API</strong>. Decode the visual arithmetic cipher below to overcharge your hyperdrive, replenish shields, and earn bonus rank points!
                    </p>

                    <div className="banana-puzzle-wrapper">
                        {loading ? (
                            <div className="loader-spinner" style={{ width: '28px', height: '28px' }} />
                        ) : puzzleData?.question && puzzleData.question !== 'SIMULATED_BANANA_PUZZLE' ? (
                            <img
                                className="banana-puzzle-img"
                                alt="Marc Conrad Banana API Challenge Puzzle"
                                src={puzzleData.question}
                            />
                        ) : (
                            <div style={{ padding: '20px', color: 'var(--amber)', fontSize: '13px', textAlign: 'center' }}>
                                <div style={{ fontWeight: 800, marginBottom: '6px' }}>⚡ PROCEDURAL CIPHER MATRIX</div>
                                <div>Solve: <strong>(3 × 2) + ? = 10</strong></div>
                            </div>
                        )}
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: 600, margin: '10px 0', color: statusColor }}>
                        {statusText}
                    </div>

                    <div className="banana-keypad">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                            <button
                                key={digit}
                                className="keypad-btn"
                                onClick={() => handleAnswer(digit)}
                            >
                                {digit}
                            </button>
                        ))}
                    </div>

                    <div className="banana-api-telemetry">
                        Endpoint: https://marcconrad.com/uob/banana/api.php?out=json
                    </div>
                </div>
            </div>
        </div>
    );
}

