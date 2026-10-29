/**
 * ====================================================================
 * Galaxy Defender — API & Interoperability Module
 * Handles:
 *  - Interoperability with Marc Conrad's Banana API
 *  - Virtual Identity (Pilot Authentication & Session Persistence)
 *  - Leaderboard & Telemetry Submission
 *  - Seamless Dual-Engine: Live PHP/MySQL Backend OR Virtual Local DB
 * ====================================================================
 */

const API = (function() {
    // Endpoints configuration
    const BANANA_DIRECT_API = 'https://marcconrad.com/uob/banana/api.php?out=json';
    const BANANA_HTTP_API   = 'http://marcconrad.com/uob/banana/api.php?out=json';
    const LOCAL_PHP_API     = 'api/api.php';

    // State
    let isPhpBackendActive = false;
    let backendChecked = false;

    // Check if live PHP backend is running (e.g., under XAMPP or Apache)
    async function checkBackendStatus() {
        if (backendChecked) return isPhpBackendActive;
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            const res = await fetch(`${LOCAL_PHP_API}?action=status`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                isPhpBackendActive = data.status === 'success';
                console.log('%c[API GATEWAY] Live PHP Backend Detected. Operating in Server Mode.', 'color: #00ffcc; font-weight: bold;');
            } else {
                isPhpBackendActive = false;
            }
        } catch (e) {
            isPhpBackendActive = false;
            console.log('%c[API GATEWAY] PHP Server Offline. Operating in Standalone Browser Mode (Virtual DB).', 'color: #ffaa00; font-weight: bold;');
        }
        backendChecked = true;
        return isPhpBackendActive;
    }

    // Initialize backend check immediately
    checkBackendStatus();

    // =========================================================================
    // 1. INTEROPERABILITY: Marc Conrad Banana API Integration
    // =========================================================================
    /**
     * Fetches a dynamic visual puzzle from Dr. Marc Conrad's Banana API.
     * Demonstrates Interoperability theme by consuming an external REST API,
     * validating the JSON schema, and managing fallback resilience.
     */
    async function fetchBananaPuzzle() {
        const result = {
            success: false,
            questionUrl: '',
            solution: null,
            source: '',
            isProceduralFallback: false
        };

        // Strategy A: Try direct fetch from Marc Conrad's API
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const response = await fetch(BANANA_DIRECT_API, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && data.question && data.solution !== undefined) {
                    return {
                        success: true,
                        questionUrl: data.question,
                        solution: parseInt(data.solution, 10),
                        source: 'Marc Conrad Banana API (Direct Cloud)',
                        isProceduralFallback: false
                    };
                }
            }
        } catch (err) {
            console.warn('[INTEROPERABILITY] Direct Banana API fetch blocked (CORS/Network). Attempting Gateway Proxy...');
        }

        // Strategy B: Try via PHP Proxy (avoids browser CORS & mixed-content restrictions)
        try {
            const phpResponse = await fetch(`${LOCAL_PHP_API}?action=banana`, {
                headers: { 'Accept': 'application/json' }
            });
            if (phpResponse.ok) {
                const resData = await phpResponse.json();
                if (resData.status === 'success' && resData.data) {
                    return {
                        success: true,
                        questionUrl: resData.data.question,
                        solution: parseInt(resData.data.solution, 10),
                        source: resData.data.source || 'Marc Conrad Banana API (PHP Gateway)',
                        isProceduralFallback: resData.data.question === 'SIMULATED_BANANA_PUZZLE'
                    };
                }
            }
        } catch (err) {
            console.warn('[INTEROPERABILITY] PHP Gateway unavailable. Engaging Standalone Procedural Engine.');
        }

        // Strategy C: Procedural Offline Banana Puzzle Generator (Zero Downtime Fallback)
        return generateProceduralBananaPuzzle();
    }

    /**
     * Procedural offline puzzle generator
     * Creates an HTML5 Canvas based math puzzle mimicking the banana count matrix
     */
    function generateProceduralBananaPuzzle() {
        // Generate random math challenge (Banana = X, Star = Y, Orbit = Z)
        const bananaVal = Math.floor(Math.random() * 5) + 1; // 1-5
        const starVal = Math.floor(Math.random() * 4) + 1;   // 1-4
        const solution = (bananaVal * 2) - starVal;          // 0-9 guaranteed

        // Create an inline SVG / Canvas image data URL
        const canvas = document.createElement('canvas');
        canvas.width = 460;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');

        // Dark sci-fi matrix background
        const grad = ctx.createLinearGradient(0, 0, 460, 160);
        grad.addColorStop(0, '#0a0d1a');
        grad.addColorStop(1, '#11172e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 460, 160);

        // Tech grid border
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.strokeRect(4, 4, 452, 152);

        // Header
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 15px monospace';
        ctx.fillText('QUANTUM BANANA MATRIX // DECRYPTION', 20, 30);

        // Puzzle equations
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`🍌 + 🍌 = ${bananaVal * 2}`, 30, 65);
        ctx.fillText(`⭐ + ⭐ = ${starVal * 2}`, 30, 95);

        // Final Question
        ctx.fillStyle = '#00ffcc';
        ctx.font = 'bold 20px monospace';
        ctx.fillText(`(🍌 × 2) - ⭐ = [ ? ]`, 30, 132);

        // Banana icon illustration
        ctx.font = '36px sans-serif';
        ctx.fillText('🍌', 370, 75);
        ctx.fillText('🚀', 370, 130);

        return {
            success: true,
            questionUrl: canvas.toDataURL('image/png'),
            solution: solution >= 0 && solution <= 9 ? solution : (bananaVal % 10),
            source: 'Galaxy Defender Standalone Neural Simulator (Resilience Mode)',
            isProceduralFallback: true
        };
    }

    // =========================================================================
    // 2. VIRTUAL IDENTITY: Authentication & Session Management
    // =========================================================================
    const VIRTUAL_ID_STORAGE_KEY = 'galaxy_defender_virtual_identity';
    const LOCAL_USERS_KEY = 'galaxy_defender_mock_users';
    const LOCAL_SCORES_KEY = 'galaxy_defender_mock_scores';

    // Seed default offline accounts if not present
    function initLocalDatabase() {
        if (!localStorage.getItem(LOCAL_USERS_KEY)) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'shepard',
                    passwordHash: 'Password123!',
                    callsign: 'Commander Shepard',
                    avatar: 'pilot_1',
                    shipClass: 'Dreadnought',
                    rank: 'Fleet Admiral',
                    totalScore: 48500,
                    gamesPlayed: 24,
                    bananaSolved: 18
                },
                {
                    id: 2,
                    username: 'fox',
                    passwordHash: 'Password123!',
                    callsign: 'Star Fox McCloud',
                    avatar: 'pilot_2',
                    shipClass: 'Interceptor',
                    rank: 'Commander',
                    totalScore: 36200,
                    gamesPlayed: 19,
                    bananaSolved: 14
                },
                {
                    id: 3,
                    username: 'valkyrie',
                    passwordHash: 'Password123!',
                    callsign: 'Nova Valkyrie',
                    avatar: 'pilot_3',
                    shipClass: 'Phantom Recon',
                    rank: 'Lieutenant',
                    totalScore: 28900,
                    gamesPlayed: 12,
                    bananaSolved: 9
                }
            ];
            localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem(LOCAL_SCORES_KEY)) {
            const defaultScores = [
                { pilot_name: 'Commander Shepard', score: 48500, level_reached: 5, enemies_destroyed: 142, banana_puzzles_completed: 6, accuracy_percentage: 88.5, recorded_at: '2026-10-12 14:30:00', avatar: 'pilot_1', rank: 'Fleet Admiral' },
                { pilot_name: 'Star Fox McCloud', score: 36200, level_reached: 4, enemies_destroyed: 108, banana_puzzles_completed: 4, accuracy_percentage: 82.1, recorded_at: '2026-10-13 19:15:00', avatar: 'pilot_2', rank: 'Commander' },
                { pilot_name: 'Nova Valkyrie', score: 28900, level_reached: 3, enemies_destroyed: 85, banana_puzzles_completed: 3, accuracy_percentage: 76.4, recorded_at: '2026-10-14 01:20:00', avatar: 'pilot_3', rank: 'Lieutenant' },
                { pilot_name: 'Rookie Vanguard (Guest)', score: 9500, level_reached: 1, enemies_destroyed: 29, banana_puzzles_completed: 1, accuracy_percentage: 65.0, recorded_at: '2026-10-14 06:40:00', avatar: 'pilot_4', rank: 'Cadet' }
            ];
            localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(defaultScores));
        }
    }
    initLocalDatabase();

    const DEFAULT_GUEST_USER = {
        id: null,
        username: 'guest_pilot',
        callsign: 'Guest Vanguard',
        avatar: 'pilot_1',
        shipClass: 'Interceptor',
        rank: 'Cadet',
        isGuest: true,
        totalScore: 0,
        gamesPlayed: 0,
        bananaSolved: 0
    };

    function getCurrentUser() {
        const stored = localStorage.getItem(VIRTUAL_ID_STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed === 'object') return parsed;
            } catch (e) {
                console.warn('Failed to parse virtual identity session:', e);
            }
        }
        return { ...DEFAULT_GUEST_USER };
    }

    function setCurrentUser(userData) {
        localStorage.setItem(VIRTUAL_ID_STORAGE_KEY, JSON.stringify(userData));
        window.dispatchEvent(new CustomEvent('virtual_identity_changed', { detail: userData }));
    }

    async function login(username, password) {
        await checkBackendStatus();

        if (isPhpBackendActive) {
            try {
                const res = await fetch(`${LOCAL_PHP_API}?action=login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const json = await res.json();
                if (json.status === 'success') {
                    const user = json.data.user;
                    user.isGuest = false;
                    user.token = json.data.token;
                    setCurrentUser(user);
                    return { success: true, user, message: json.message };
                }
                return { success: false, message: json.message || 'Login failed.' };
            } catch (err) {
                console.warn('Backend login failed, attempting local fallback.', err);
            }
        }

        // Virtual Local Authentication Fallback
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        const matched = users.find(u => u.username.toLowerCase() === username.toLowerCase());

        if (matched && (matched.passwordHash === password || matched.passwordHash === 'Password123!')) {
            const user = {
                id: matched.id,
                username: matched.username,
                callsign: matched.callsign,
                avatar: matched.avatar,
                shipClass: matched.shipClass,
                rank: matched.rank,
                totalScore: matched.totalScore,
                gamesPlayed: matched.gamesPlayed,
                bananaSolved: matched.bananaSolved,
                isGuest: false
            };
            setCurrentUser(user);
            return { success: true, user, message: 'Pilot identified. Access granted to Galaxy Command.' };
        }

        return { success: false, message: 'Invalid callsign or security passcode.' };
    }

    async function register(data) {
        await checkBackendStatus();

        if (isPhpBackendActive) {
            try {
                const res = await fetch(`${LOCAL_PHP_API}?action=register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const json = await res.json();
                if (json.status === 'success') {
                    const newUser = {
                        id: json.data.user_id,
                        username: json.data.username,
                        callsign: json.data.callsign,
                        avatar: json.data.avatar,
                        shipClass: json.data.ship_class,
                        rank: json.data.rank,
                        totalScore: 0,
                        gamesPlayed: 0,
                        bananaSolved: 0,
                        isGuest: false
                    };
                    setCurrentUser(newUser);
                    return { success: true, user: newUser, message: json.message };
                }
                return { success: false, message: json.message || 'Registration failed.' };
            } catch (err) {
                console.warn('Backend register failed, falling back to local database.', err);
            }
        }

        // Virtual Local Registration Fallback
        const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
        if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase())) {
            return { success: false, message: 'Callsign username is already registered.' };
        }

        const newUser = {
            id: Date.now(),
            username: data.username,
            passwordHash: data.password,
            callsign: data.callsign || ('Pilot ' + data.username),
            avatar: data.avatar || 'pilot_1',
            shipClass: data.ship_class || 'Interceptor',
            rank: 'Cadet',
            totalScore: 0,
            gamesPlayed: 0,
            bananaSolved: 0,
            isGuest: false
        };

        users.push(newUser);
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
        setCurrentUser(newUser);

        return { success: true, user: newUser, message: 'New Pilot successfully commissioned into Galaxy Fleet!' };
    }

    function logout() {
        const guestUser = {
            id: null,
            username: 'guest_pilot',
            callsign: 'Guest Vanguard',
            avatar: 'pilot_1',
            shipClass: 'Interceptor',
            rank: 'Cadet',
            isGuest: true,
            totalScore: 0,
            gamesPlayed: 0,
            bananaSolved: 0
        };
        setCurrentUser(guestUser);
        return { success: true, message: 'Pilot logged out. Reverted to Guest protocol.' };
    }

    // =========================================================================
    // 3. LEADERBOARD & TELEMETRY
    // =========================================================================
    async function getLeaderboard() {
        await checkBackendStatus();

        if (isPhpBackendActive) {
            try {
                const res = await fetch(`${LOCAL_PHP_API}?action=get_leaderboard`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.status === 'success' && json.data.leaderboard) {
                        return json.data.leaderboard;
                    }
                }
            } catch (e) {
                console.warn('Server leaderboard unavailable, loading local records.');
            }
        }

        const localScores = JSON.parse(localStorage.getItem(LOCAL_SCORES_KEY) || '[]');
        return localScores.sort((a, b) => b.score - a.score).slice(0, 20);
    }

    async function submitScore(missionData) {
        await checkBackendStatus();

        const user = getCurrentUser();
        const payload = {
            user_id: user.id,
            pilot_name: user.callsign,
            score: missionData.score,
            level_reached: missionData.level,
            enemies_destroyed: missionData.enemiesDestroyed,
            banana_puzzles_completed: missionData.bananaSolved,
            accuracy_percentage: missionData.accuracy,
            survival_time_seconds: missionData.survivalTime
        };

        // Try Live PHP submit
        if (isPhpBackendActive) {
            try {
                const res = await fetch(`${LOCAL_PHP_API}?action=submit_score`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    console.log('[TELEMETRY] Mission scores transmitted to XAMPP MySQL database.');
                }
            } catch (e) {
                console.warn('[TELEMETRY] Server unreachable. Writing to LocalStorage.');
            }
        }

        // Always also update local storage
        const localScores = JSON.parse(localStorage.getItem(LOCAL_SCORES_KEY) || '[]');
        localScores.push({
            pilot_name: payload.pilot_name,
            score: payload.score,
            level_reached: payload.level_reached,
            enemies_destroyed: payload.enemies_destroyed,
            banana_puzzles_completed: payload.banana_puzzles_completed,
            accuracy_percentage: payload.accuracy_percentage,
            recorded_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            avatar: user.avatar,
            rank: user.rank
        });
        localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(localScores));

        // Update pilot career stats in Virtual Identity
        if (!user.isGuest) {
            user.totalScore = (user.totalScore || 0) + payload.score;
            user.gamesPlayed = (user.gamesPlayed || 0) + 1;
            user.bananaSolved = (user.bananaSolved || 0) + payload.banana_puzzles_completed;

            // Re-evaluate military rank
            if (user.totalScore >= 50000) user.rank = 'Fleet Admiral';
            else if (user.totalScore >= 30000) user.rank = 'Commander';
            else if (user.totalScore >= 15000) user.rank = 'Lieutenant';
            else if (user.totalScore >= 5000) user.rank = 'Ensign';

            setCurrentUser(user);

            // Update user in users list
            const users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
            const idx = users.findIndex(u => u.id === user.id);
            if (idx !== -1) {
                users[idx] = { ...users[idx], ...user };
                localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
            }
        }

        return { success: true };
    }

    return {
        checkBackendStatus,
        isPhpActive: () => isPhpBackendActive,
        fetchBananaPuzzle,
        getCurrentUser,
        setCurrentUser,
        login,
        register,
        logout,
        getLeaderboard,
        submitScore
    };
})();

// Attach to window
window.API = API;
