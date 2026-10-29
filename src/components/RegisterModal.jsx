/**
 * RegisterModal.jsx — New Pilot Commission Form
 * Virtual Identity Theme: Register new pilot identity in SQLite
 */
import { useState } from 'react';
import API from '../services/api.js';

const SHIPS = ['Interceptor', 'Destroyer', 'Phantom Recon', 'Titan Heavy', 'Strike Fighter'];
const AVATARS = [
    { id: 'pilot_1', label: 'Vanguard' },
    { id: 'pilot_2', label: 'Phantom' },
    { id: 'pilot_3', label: 'Nova' },
    { id: 'pilot_4', label: 'Inferno' },
];

export default function RegisterModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        username: '',
        callsign: '',
        password: '',
        confirmPassword: '',
        avatar: 'pilot_1',
        shipClass: 'Interceptor',
    });
    const [statusMsg, setStatusMsg] = useState('');
    const [statusColor, setStatusColor] = useState('var(--cyan)');
    const [loading, setLoading] = useState(false);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMsg('');

        if (!form.username.trim() || !form.callsign.trim() || !form.password) {
            setStatusColor('var(--crimson-primary, #ff3366)');
            setStatusMsg('All fields are required.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setStatusColor('var(--crimson-primary, #ff3366)');
            setStatusMsg('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setStatusColor('var(--crimson-primary, #ff3366)');
            setStatusMsg('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setStatusMsg('Commissioning pilot identity in SQLite...');
        setStatusColor('var(--cyan)');

        try {
            const result = await API.register({
                username: form.username.trim(),
                callsign: form.callsign.trim() || form.username.trim(),
                password: form.password,
                avatar: form.avatar,
                shipClass: form.shipClass,
            });
            if (result.success) {
                setStatusColor('var(--emerald-primary, #00f59b)');
                setStatusMsg(`Pilot "${form.callsign || form.username}" commissioned! Logging in...`);
                setTimeout(() => {
                    onSuccess && onSuccess(result.user);
                    onClose();
                }, 900);
            } else {
                setStatusColor('var(--crimson-primary, #ff3366)');
                setStatusMsg(result.message || 'Registration failed. Try a different username.');
            }
        } catch {
            setStatusColor('var(--crimson-primary, #ff3366)');
            setStatusMsg('Server unreachable. Virtual Identity mode active.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content" style={{ maxWidth: '480px' }}>
                <div className="modal-header">
                    <div className="modal-title">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <line x1="19" y1="8" x2="19" y2="14"/>
                            <line x1="22" y1="11" x2="16" y2="11"/>
                        </svg>
                        <span>COMMISSION NEW PILOT</span>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ marginTop: '8px' }}>
                    {/* Avatar selector */}
                    <div className="form-group">
                        <label className="form-label">Select Pilot Avatar</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {AVATARS.map(av => (
                                <button
                                    key={av.id}
                                    type="button"
                                    onClick={() => set('avatar', av.id)}
                                    style={{
                                        flex: 1,
                                        minWidth: '90px',
                                        padding: '10px 6px',
                                        background: form.avatar === av.id ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${form.avatar === av.id ? '#00f0ff' : 'rgba(255,255,255,0.1)'}`,
                                        borderRadius: '8px',
                                        color: form.avatar === av.id ? '#00f0ff' : 'rgba(255,255,255,0.5)',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                        <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    {av.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Username + Callsign */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" htmlFor="regUsername">Username</label>
                            <input
                                id="regUsername"
                                className="form-input"
                                type="text"
                                placeholder="pilot_username"
                                value={form.username}
                                onChange={e => set('username', e.target.value)}
                                autoComplete="username"
                                required
                                autoFocus
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" htmlFor="regCallsign">Callsign</label>
                            <input
                                id="regCallsign"
                                className="form-input"
                                type="text"
                                placeholder="e.g. Ghost"
                                value={form.callsign}
                                onChange={e => set('callsign', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Ship class */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="regShipClass">Vessel Class</label>
                        <select
                            id="regShipClass"
                            className="form-input"
                            style={{ background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                            value={form.shipClass}
                            onChange={e => set('shipClass', e.target.value)}
                        >
                            {SHIPS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Password */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" htmlFor="regPassword">Password</label>
                            <input
                                id="regPassword"
                                className="form-input"
                                type="password"
                                placeholder="Min 6 chars"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label" htmlFor="regConfirm">Confirm Password</label>
                            <input
                                id="regConfirm"
                                className="form-input"
                                type="password"
                                placeholder="Repeat password"
                                value={form.confirmPassword}
                                onChange={e => set('confirmPassword', e.target.value)}
                                autoComplete="new-password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', marginTop: '6px' }}
                        disabled={loading}
                    >
                        {loading
                            ? <div className="loader-spinner" style={{ width: '12px', height: '12px' }} />
                            : 'COMMISSION PILOT IDENTITY'}
                    </button>

                    {statusMsg && (
                        <div style={{ marginTop: '10px', fontSize: '12px', color: statusColor, textAlign: 'center', fontWeight: 600 }}>
                            {statusMsg}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
