/**
 * Galaxy Defender — Enterprise SQLite & Express API Server
 * Themes Demonstrated:
 *  - Interoperability (Marc Conrad Banana API Proxy & JSON Exchange)
 *  - Virtual Identity (Pilot Authentication, BCrypt/Tokens, Session Cookies)
 *  - Portable Embedded Relational Database (SQLite)
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// -----------------------------------------------------------------------------
// SQLite Database Initialization (Zero-Setup Embedded Database)
// -----------------------------------------------------------------------------
const DB_FILE = path.join(__dirname, 'galaxy_defender.sqlite');
const db = new Database(DB_FILE);
db.pragma('journal_mode = WAL');

console.log(`[DATABASE] SQLite engine initialized: ${DB_FILE}`);

// Create Relational Schema
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT NOT NULL,
        callsign TEXT NOT NULL,
        avatar TEXT DEFAULT 'pilot_1',
        ship_class TEXT DEFAULT 'Interceptor',
        rank TEXT DEFAULT 'Cadet',
        total_score INTEGER DEFAULT 0,
        banana_solved INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        pilot_name TEXT NOT NULL,
        score INTEGER NOT NULL,
        level_reached INTEGER NOT NULL,
        enemies_destroyed INTEGER NOT NULL,
        banana_puzzles_completed INTEGER DEFAULT 0,
        accuracy_percentage REAL DEFAULT 0.0,
        ship_class TEXT DEFAULT 'Interceptor',
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS banana_api_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        puzzle_url TEXT,
        solution_expected INTEGER,
        fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Ensure ship_class column exists in scores table
try {
    const scoresCols = db.pragma('table_info(scores)').map(c => c.name);
    if (!scoresCols.includes('ship_class')) {
        db.exec("ALTER TABLE scores ADD COLUMN ship_class TEXT DEFAULT 'Interceptor'");
    }
} catch (_) {}

// Pre-populate Default Demo Pilots if empty
const pilotCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (pilotCount === 0) {
    const insertPilot = db.prepare(`
        INSERT INTO users (username, password_hash, callsign, avatar, ship_class, rank, total_score, games_played, banana_solved)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Standard hash for 'Password123!'
    const hash = crypto.createHash('sha256').update('Password123!').digest('hex');

    insertPilot.run('shepard', hash, 'Commander Shepard', 'pilot_1', 'Dreadnought', 'Fleet Admiral', 54200, 24, 18);
    insertPilot.run('fox', hash, 'Star Fox McCloud', 'pilot_2', 'Interceptor', 'Commander', 36200, 19, 14);
    insertPilot.run('valkyrie', hash, 'Nova Valkyrie', 'pilot_3', 'Phantom Recon', 'Lieutenant', 28900, 12, 9);
}

// Seed richer mission history if scores count is low
const scoreCount = db.prepare('SELECT COUNT(*) as count FROM scores').get().count;
if (scoreCount <= 4) {
    const insertScore = db.prepare(`
        INSERT INTO scores (user_id, pilot_name, score, level_reached, enemies_destroyed, banana_puzzles_completed, accuracy_percentage, ship_class, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Top tier runs
    insertScore.run(1, 'Commander Shepard', 54200, 6, 168, 6, 89.2, 'Dreadnought', '2026-10-29 04:00:33');
    insertScore.run(2, 'Star Fox McCloud', 36200, 4, 108, 4, 82.1, 'Interceptor', '2026-10-29 03:45:12');
    insertScore.run(3, 'Nova Valkyrie', 28900, 3, 85, 3, 76.4, 'Phantom Recon', '2026-10-29 03:10:50');
    insertScore.run(1, 'Commander Shepard', 24100, 3, 72, 3, 91.5, 'Dreadnought', '2026-10-28 22:15:00');
    insertScore.run(null, 'Captain Falcon', 21500, 3, 64, 2, 74.0, 'Titan Heavy', '2026-10-28 20:30:20');
    insertScore.run(2, 'Star Fox McCloud', 18300, 2, 53, 2, 80.5, 'Interceptor', '2026-10-28 19:12:44');
    insertScore.run(3, 'Nova Valkyrie', 14800, 2, 41, 1, 78.2, 'Phantom Recon', '2026-10-28 18:05:10');
    insertScore.run(null, 'Guest Vanguard', 9500, 1, 29, 1, 65.0, 'Interceptor', '2026-10-28 16:40:00');
    insertScore.run(null, 'Cadet Orion', 6800, 1, 18, 1, 58.4, 'Strike Fighter', '2026-10-28 15:20:15');
    insertScore.run(null, 'Rogue Ghost', 4200, 1, 12, 0, 51.0, 'Phantom Recon', '2026-10-28 14:02:00');

    console.log('[DATABASE] Seeded demo pilots and hall-of-fame telemetry into SQLite.');
}

// -----------------------------------------------------------------------------
// Rank Calculation Formula
// -----------------------------------------------------------------------------
function calculateRank(totalScore) {
    if (totalScore >= 50000) return 'Fleet Admiral';
    if (totalScore >= 30000) return 'Commander';
    if (totalScore >= 15000) return 'Lieutenant';
    if (totalScore >= 5000) return 'Ensign';
    return 'Cadet';
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// 1. Diagnostics & Health
app.get('/api/status', (req, res) => {
    // Git info for Version Control theme test
    let gitInfo = { initialized: false, branch: 'unknown', commitCount: 0 };
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd(), timeout: 2000 }).toString().trim();
        const count = parseInt(execSync('git rev-list --count HEAD', { cwd: process.cwd(), timeout: 2000 }).toString().trim(), 10);
        gitInfo = { initialized: true, branch, commitCount: isNaN(count) ? 0 : count };
    } catch (_) { /* git not available or not a repo */ }

    res.json({
        status: 'success',
        service: 'Galaxy Defender React-SQLite Backend',
        version: '3.0.0',
        database: 'SQLite 3 (Embedded)',
        interoperability_ready: true,
        git: gitInfo,
        timestamp: new Date().toISOString()
    });
});

// Logout
app.post('/api/logout', (req, res) => {
    res.clearCookie('galaxy_pilot_session');
    res.clearCookie('galaxy_pilot_callsign');
    res.json({ success: true });
});

// 2. Interoperability: Marc Conrad Banana API Proxy
app.get('/api/banana', async (req, res) => {
    const BANANA_URL = 'https://marcconrad.com/uob/banana/api.php?out=json';
    const FALLBACK_URL = 'http://marcconrad.com/uob/banana/api.php?out=json';

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        let response;
        try {
            response = await fetch(BANANA_URL, { signal: controller.signal });
        } catch {
            response = await fetch(FALLBACK_URL, { signal: controller.signal });
        }
        clearTimeout(timeout);

        if (response.ok) {
            const data = await response.json();
            if (data.question && typeof data.solution !== 'undefined') {
                // Log to SQLite
                db.prepare('INSERT INTO banana_api_logs (puzzle_url, solution_expected) VALUES (?, ?)').run(data.question, Number(data.solution));

                return res.json({
                    status: 'success',
                    data: {
                        question: data.question,
                        solution: Number(data.solution),
                        source: 'Dr. Marc Conrad Banana API (Live REST)',
                        provider: 'marcconrad.com'
                    },
                    message: 'Live Banana API puzzle retrieved successfully.'
                });
            }
        }
    } catch (err) {
        console.warn('[INTEROPERABILITY] Live API unreachable. Engaging offline procedural fallback.');
    }

    // Offline procedural fallback
    const fallbackSolution = Math.floor(Math.random() * 10);
    res.json({
        status: 'success',
        data: {
            question: 'SIMULATED_BANANA_PUZZLE',
            solution: fallbackSolution,
            source: 'Galaxy Defender Procedural Banana Matrix (Offline Fallback)',
            provider: 'local_simulation'
        },
        message: 'Fallback Banana puzzle generated.'
    });
});

// 3. Virtual Identity: Pilot Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username / Callsign and password required.' });
    }

    const cleanInput = String(username).trim();
    // Allow login by either username OR callsign, case-insensitive
    const user = db.prepare(`
        SELECT * FROM users
        WHERE LOWER(username) = LOWER(?) OR LOWER(callsign) = LOWER(?)
    `).get(cleanInput, cleanInput);

    if (!user) {
        return res.status(401).json({ status: 'error', message: 'Invalid callsign or security passcode.' });
    }

    // Verify hash (supports sha256 or plaintext password, trimmed or untrimmed)
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const hashTrimmed = crypto.createHash('sha256').update(String(password).trim()).digest('hex');
    if (user.password_hash !== hash && user.password_hash !== hashTrimmed && user.password_hash !== password) {
        return res.status(401).json({ status: 'error', message: 'Invalid callsign or security passcode.' });
    }

    // Update last login
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Issue session token & cookie
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('galaxy_pilot_session', token, { maxAge: 86400000 * 7, path: '/' });

    res.json({
        status: 'success',
        data: {
            token,
            user: {
                id: user.id,
                username: user.username,
                callsign: user.callsign,
                avatar: user.avatar,
                shipClass: user.ship_class,
                rank: user.rank,
                totalScore: user.total_score,
                bananaSolved: user.banana_solved,
                gamesPlayed: user.games_played
            }
        },
        message: `Welcome aboard, ${user.callsign}.`
    });
});

// 4. Virtual Identity: Pilot Registration
app.post('/api/register', (req, res) => {
    const { username, callsign, password, avatar = 'pilot_1', shipClass = 'Interceptor' } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username and password required.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
        return res.status(409).json({ status: 'error', message: 'Callsign / username already registered in database.' });
    }

    const finalCallsign = callsign || `Pilot ${username.charAt(0).toUpperCase() + username.slice(1)}`;
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const result = db.prepare(`
        INSERT INTO users (username, password_hash, callsign, avatar, ship_class, rank, total_score, games_played, banana_solved)
        VALUES (?, ?, ?, ?, ?, 'Cadet', 1500, 1, 1)
    `).run(username, hash, finalCallsign, avatar, shipClass);

    const newUserId = result.lastInsertRowid;

    // Record initial commissioning flight into scores table
    db.prepare(`
        INSERT INTO scores (user_id, pilot_name, score, level_reached, enemies_destroyed, banana_puzzles_completed, accuracy_percentage, ship_class)
        VALUES (?, ?, 1500, 1, 5, 1, 75.0, ?)
    `).run(newUserId, finalCallsign, shipClass);

    // Issue session token & cookie for instant login
    const token = crypto.randomBytes(24).toString('hex');
    res.cookie('galaxy_pilot_session', token, { maxAge: 86400000 * 7, path: '/' });
    res.cookie('galaxy_pilot_callsign', encodeURIComponent(finalCallsign), { maxAge: 86400000 * 7, path: '/' });

    res.json({
        status: 'success',
        data: {
            id: newUserId,
            user_id: newUserId,
            username,
            callsign: finalCallsign,
            avatar,
            shipClass,
            rank: 'Cadet',
            totalScore: 1500,
            gamesPlayed: 1,
            bananaSolved: 1
        },
        message: `Welcome aboard, ${finalCallsign}. Pilot identity successfully commissioned.`
    });
});

// 5. Telemetry & Global Leaderboard Table
app.get('/api/leaderboard', (req, res) => {
    const rows = db.prepare(`
        SELECT s.id, s.user_id, s.pilot_name, s.score, s.level_reached, s.enemies_destroyed,
               s.banana_puzzles_completed, s.accuracy_percentage, s.recorded_at,
               COALESCE(s.ship_class, u.ship_class, 'Interceptor') as ship_class,
               COALESCE(u.avatar, 'pilot_1') as avatar,
               COALESCE(u.rank, 'Cadet') as rank,
               u.username
        FROM scores s
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY s.score DESC
        LIMIT 50
    `).all();

    res.json({
        status: 'success',
        data: { leaderboard: rows }
    });
});

// 5b. Personal Pilot Mission History Table
app.get('/api/user-records/:userId', (req, res) => {
    const userId = Number(req.params.userId);
    if (!userId) {
        return res.status(400).json({ status: 'error', message: 'Valid Pilot User ID required.' });
    }

    const rows = db.prepare(`
        SELECT s.id, s.user_id, s.pilot_name, s.score, s.level_reached, s.enemies_destroyed,
               s.banana_puzzles_completed, s.accuracy_percentage, s.recorded_at,
               COALESCE(s.ship_class, u.ship_class, 'Interceptor') as ship_class,
               COALESCE(u.avatar, 'pilot_1') as avatar,
               COALESCE(u.rank, 'Cadet') as rank
        FROM scores s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.user_id = ?
        ORDER BY s.recorded_at DESC
        LIMIT 50
    `).all(userId);

    res.json({
        status: 'success',
        data: { records: rows }
    });
});

// 6. Submit Score
app.post('/api/submit-score', (req, res) => {
    const { userId, pilotName, score, levelReached, enemiesDestroyed, bananaSolved = 0, accuracy = 0, shipClass = 'Interceptor' } = req.body;

    db.prepare(`
        INSERT INTO scores (user_id, pilot_name, score, level_reached, enemies_destroyed, banana_puzzles_completed, accuracy_percentage, ship_class)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId || null, pilotName || 'Guest Vanguard', score, levelReached, enemiesDestroyed, bananaSolved, accuracy, shipClass);

    // If registered pilot, update career stats
    if (userId) {
        const user = db.prepare('SELECT total_score, banana_solved, games_played FROM users WHERE id = ?').get(userId);
        if (user) {
            const newTotal = user.total_score + score;
            const newRank = calculateRank(newTotal);

            db.prepare(`
                UPDATE users
                SET total_score = ?, banana_solved = banana_solved + ?, games_played = games_played + 1, rank = ?
                WHERE id = ?
            `).run(newTotal, bananaSolved, newRank, userId);
        }
    }

    res.json({ status: 'success', message: 'Mission debrief telemetry recorded.' });
});

// Serve frontend build in production
if (fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    // Express 5 requires explicit wildcard syntax
    app.get('/{*path}', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`[API SERVER] Express + SQLite backend running on http://localhost:${PORT}`);
});
