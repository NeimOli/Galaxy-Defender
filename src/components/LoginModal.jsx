import React, { useState } from 'react';
import { API } from '../services/api';

export default function LoginModal({ isOpen = true, onClose, onSuccess, onSuccessLogin, onGoRegister, onSwitchToRegister }) {
    const handleSuccess = onSuccess || onSuccessLogin || (() => {});
    const handleSwitch = onGoRegister || onSwitchToRegister || (() => {});
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [statusMsg, setStatusMsg] = useState('');
    const [statusColor, setStatusColor] = useState('var(--cyan)');
    const [loading, setLoading] = useState(false);

    if (isOpen === false) return null;

    const fillDemo = (user) => {
        setUsername(user);
        setPassword('Password123!');
        setStatusColor('var(--gold-primary)');
        setStatusMsg(`Demo credentials loaded for ${user}. Click Authorize.`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg('Verifying credentials against SQLite database...');
        setStatusColor('var(--cyan)');

        const result = await API.login(username.trim(), password);
        setLoading(false);

        if (result.success) {
            setStatusColor('var(--emerald-primary)');
            setStatusMsg(`Welcome aboard, ${result.user.callsign}!`);
            setTimeout(() => {
                handleSuccess(result.user);
                onClose();
            }, 800);
        } else {
            setStatusColor('var(--crimson-primary)');
            setStatusMsg(result.message || 'Authorization failed.');
        }
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal-content" style={{ maxWidth: '440px' }}>
                <div className="modal-header">
                    <div className="modal-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="16" rx="2"/>
                            <circle cx="9" cy="10" r="2"/>
                            <path d="M15 8h2m-2 4h2M6 16c0-1.5 1.5-2 3-2s3 .5 3 2m3 0h2"/>
                        </svg>
                        <span>PILOT AUTHENTICATION</span>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="loginUsername">Pilot Callsign / Username</label>
                        <input
                            id="loginUsername"
                            className="form-input"
                            type="text"
                            placeholder="e.g. shepard or fox"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="loginPassword">Security Passcode</label>
                        <input
                            id="loginPassword"
                            className="form-input"
                            type="password"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', marginTop: '6px' }}
                        disabled={loading}
                    >
                        {loading ? <div className="loader-spinner" style={{ width: '12px', height: '12px' }} /> : 'AUTHORIZE ACCESS'}
                    </button>

                    {/* Quick Demo Credentials */}
                    <div style={{ marginTop: '14px', padding: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed var(--border-card)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontFamily: 'var(--font-heading)', color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            One-Click Demo Credentials
                        </div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '9px', padding: '4px 8px' }} onClick={() => fillDemo('shepard')}>Shepard (Admiral)</button>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '9px', padding: '4px 8px' }} onClick={() => fillDemo('fox')}>Star Fox</button>
                            <button type="button" className="btn btn-secondary" style={{ fontSize: '9px', padding: '4px 8px' }} onClick={() => fillDemo('valkyrie')}>Valkyrie</button>
                        </div>
                    </div>

                    {statusMsg && (
                        <div style={{ marginTop: '12px', fontSize: '12px', color: statusColor, textAlign: 'center', fontWeight: 600 }}>
                            {statusMsg}
                        </div>
                    )}

                    <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Unregistered pilot?{' '}
                        <button
                            type="button"
                            onClick={handleSwitch}
                            style={{ background: 'none', border: 'none', color: 'var(--cyan-primary)', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                        >
                            Commission New Pilot →
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

