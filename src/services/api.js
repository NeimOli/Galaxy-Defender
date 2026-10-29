/**
 * Galaxy Defender — React API & Interoperability Client
 * Interfaces with:
 *  - SQLite Express Backend (/api/...)
 *  - Dr. Marc Conrad Banana API Gateway
 *  - Local fallback state
 */

const API_BASE = '/api';

export const API = {
    async checkBackendStatus() {
        try {
            const res = await fetch(`${API_BASE}/status`);
            if (res.ok) {
                const data = await res.json();
                return data.status === 'success';
            }
        } catch {
            return false;
        }
        return false;
    },

    async fetchBananaPuzzle() {
        try {
            const res = await fetch(`${API_BASE}/banana`);
            if (res.ok) {
                const json = await res.json();
                if (json.status === 'success' && json.data) {
                    return json.data;
                }
            }
        } catch (e) {
            console.warn('[CLIENT API] Error fetching Banana puzzle:', e);
        }

        // Offline procedural fallback
        const solution = Math.floor(Math.random() * 10);
        return {
            question: 'SIMULATED_BANANA_PUZZLE',
            solution,
            source: 'Procedural Neural Cipher (Offline Fallback)',
            provider: 'client_simulation',
            isFallback: true
        };
    },

    async login(username, password) {
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.status === 'success') {
                this.setCurrentUser(data.data.user);
                return { success: true, user: data.data.user, message: data.message };
            }
            return { success: false, message: data.message || 'Authorization failed.' };
        } catch {
            // Local fallback login for demo
            if (password === 'Password123!') {
                const demoUsers = {
                    shepard: { id: 1, username: 'shepard', callsign: 'Commander Shepard', avatar: 'pilot_1', shipClass: 'Dreadnought', rank: 'Fleet Admiral', totalScore: 54200, gamesPlayed: 24, bananaSolved: 18 },
                    fox: { id: 2, username: 'fox', callsign: 'Star Fox McCloud', avatar: 'pilot_2', shipClass: 'Interceptor', rank: 'Commander', totalScore: 36200, gamesPlayed: 19, bananaSolved: 14 },
                    valkyrie: { id: 3, username: 'valkyrie', callsign: 'Nova Valkyrie', avatar: 'pilot_3', shipClass: 'Phantom Recon', rank: 'Lieutenant', totalScore: 28900, gamesPlayed: 12, bananaSolved: 9 }
                };
                if (demoUsers[username]) {
                    this.setCurrentUser(demoUsers[username]);
                    return { success: true, user: demoUsers[username], message: 'Welcome aboard (Virtual Identity Mode).' };
                }
            }
            return { success: false, message: 'Invalid credentials or server unavailable.' };
        }
    },

    async register(payload) {
        try {
            const res = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.status === 'success') {
                this.setCurrentUser(data.data);
                return { success: true, user: data.data, message: data.message };
            }
            return { success: false, message: data.message || 'Commission failed.' };
        } catch {
            const localUser = {
                id: Date.now(),
                username: payload.username,
                callsign: payload.callsign || payload.username,
                avatar: payload.avatar || 'pilot_1',
                shipClass: payload.shipClass || 'Interceptor',
                rank: 'Cadet',
                totalScore: 0,
                gamesPlayed: 0,
                bananaSolved: 0
            };
            this.setCurrentUser(localUser);
            return { success: true, user: localUser, message: 'Pilot commissioned in Virtual Identity mode.' };
        }
    },

    async getLeaderboard() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.isGuest || !currentUser.id) {
            return [];
        }

        try {
            const res = await fetch(`${API_BASE}/leaderboard`);
            if (res.ok) {
                const json = await res.json();
                if (json.status === 'success' && json.data?.leaderboard) {
                    return json.data.leaderboard;
                }
            }
        } catch (e) {
            console.warn('[CLIENT API] Leaderboard fetch fallback:', e);
        }

        // Return fallback leaderboard
        return [
            { id: 1, user_id: 1, pilot_name: 'Commander Shepard', score: 54200, level_reached: 6, enemies_destroyed: 168, banana_puzzles_completed: 6, accuracy_percentage: 89.2, ship_class: 'Dreadnought', avatar: 'pilot_1', rank: 'Fleet Admiral', recorded_at: '2026-10-29 04:00' },
            { id: 2, user_id: 2, pilot_name: 'Star Fox McCloud', score: 36200, level_reached: 4, enemies_destroyed: 108, banana_puzzles_completed: 4, accuracy_percentage: 82.1, ship_class: 'Interceptor', avatar: 'pilot_2', rank: 'Commander', recorded_at: '2026-10-29 03:45' },
            { id: 3, user_id: 3, pilot_name: 'Nova Valkyrie', score: 28900, level_reached: 3, enemies_destroyed: 85, banana_puzzles_completed: 3, accuracy_percentage: 76.4, ship_class: 'Phantom Recon', avatar: 'pilot_3', rank: 'Lieutenant', recorded_at: '2026-10-29 03:10' },
            { id: 4, user_id: 1, pilot_name: 'Commander Shepard', score: 24100, level_reached: 3, enemies_destroyed: 72, banana_puzzles_completed: 3, accuracy_percentage: 91.5, ship_class: 'Dreadnought', avatar: 'pilot_1', rank: 'Fleet Admiral', recorded_at: '2026-10-28 22:15' },
            { id: 5, user_id: null, pilot_name: 'Captain Falcon', score: 21500, level_reached: 3, enemies_destroyed: 64, banana_puzzles_completed: 2, accuracy_percentage: 74.0, ship_class: 'Titan Heavy', avatar: 'pilot_4', rank: 'Lieutenant', recorded_at: '2026-10-28 20:30' },
            { id: 6, user_id: null, pilot_name: 'Rookie Vanguard (Guest)', score: 9500, level_reached: 1, enemies_destroyed: 29, banana_puzzles_completed: 1, accuracy_percentage: 65.0, ship_class: 'Interceptor', avatar: 'pilot_1', rank: 'Cadet', recorded_at: '2026-10-28 16:40' }
        ];
    },

    async getUserRecords(userId) {
        if (!userId) return [];
        const currentUser = this.getCurrentUser();
        if (!currentUser || currentUser.isGuest || !currentUser.id) {
            return [];
        }

        try {
            const res = await fetch(`${API_BASE}/user-records/${userId}`);
            if (res.ok) {
                const json = await res.json();
                if (json.status === 'success' && json.data?.records) {
                    return json.data.records;
                }
            }
        } catch (e) {
            console.warn('[CLIENT API] User records fetch fallback:', e);
        }
        const all = await this.getLeaderboard();
        return all.filter(s => s.user_id === userId);
    },

    async submitScore(payload) {
        const currentUser = this.getCurrentUser();
        const body = {
            userId: payload.userId || currentUser.id || null,
            pilotName: payload.pilotName || currentUser.callsign || 'Guest Vanguard',
            shipClass: payload.shipClass || currentUser.shipClass || 'Interceptor',
            score: payload.score,
            levelReached: payload.levelReached || payload.level || 1,
            enemiesDestroyed: payload.enemiesDestroyed || 0,
            bananaSolved: payload.bananaSolved || 0,
            accuracy: payload.accuracy || 0
        };

        try {
            await fetch(`${API_BASE}/submit-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
        } catch (e) {
            console.warn('[CLIENT API] Submit score offline:', e);
        }
    },

    getCurrentUser() {
        const stored = localStorage.getItem('galaxy_virtual_pilot');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch { }
        }
        return {
            id: null,
            username: 'guest_pilot',
            callsign: 'Guest Vanguard',
            avatar: 'pilot_1',
            shipClass: 'Interceptor',
            rank: 'Cadet',
            totalScore: 0,
            gamesPlayed: 0,
            bananaSolved: 0,
            isGuest: true
        };
    },

    setCurrentUser(user) {
        localStorage.setItem('galaxy_virtual_pilot', JSON.stringify(user));
        document.cookie = `galaxy_pilot_session=${user.id || 'virtual'}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `galaxy_pilot_callsign=${encodeURIComponent(user.callsign)}; path=/; max-age=604800; SameSite=Lax`;
        window.dispatchEvent(new CustomEvent('virtual_identity_changed', { detail: user }));
    },

    logout() {
        const guest = {
            id: null,
            username: 'guest_pilot',
            callsign: 'Guest Vanguard',
            avatar: 'pilot_1',
            shipClass: 'Interceptor',
            rank: 'Cadet',
            totalScore: 0,
            gamesPlayed: 0,
            bananaSolved: 0,
            isGuest: true
        };
        this.setCurrentUser(guest);
        document.cookie = 'galaxy_pilot_session=; path=/; max-age=0';
        fetch(`${API_BASE}/logout`, { method: 'POST' }).catch(() => { });
        return guest;
    }
};

export default API;

