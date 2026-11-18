import express from 'express';
import cors from 'cors';
import fs from 'fs';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { execSync } from 'child_process';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS, Cookies, and JSON body parsing
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(cookieParser());
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
        current_level INTEGER DEFAULT 1,
        max_sector INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
    );

    CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

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

// Ensure dynamic columns exist if database was previously created
try {
    const scoresCols = db.pragma('table_info(scores)').map(c => c.name);
    if (!scoresCols.includes('ship_class')) {
        db.exec("ALTER TABLE scores ADD COLUMN ship_class TEXT DEFAULT 'Interceptor'");
    }
    const userCols = db.pragma('table_info(users)').map(c => c.name);
    if (!userCols.includes('current_level')) {
        db.exec("ALTER TABLE users ADD COLUMN current_level INTEGER DEFAULT 1");
    }
    if (!userCols.includes('max_sector')) {
        db.exec("ALTER TABLE users ADD COLUMN max_sector INTEGER DEFAULT 1");
    }
} catch (_) { }

// Pre-populate Default Demo Pilots if empty (using salted BCrypt password hashing)
const pilotCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (pilotCount === 0) {
    const insertPilot = db.prepare(`
        INSERT INTO users (username, password_hash, callsign, avatar, ship_class, rank, total_score, games_played, banana_solved, current_level, max_sector)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Standard salted BCrypt hash (10 salt rounds) for 'Password123!'
    const bHash = bcrypt.hashSync('Password123!', 10);

    insertPilot.run('shepard', bHash, 'Commander Shepard', 'pilot_1', 'Dreadnought', 'Fleet Admiral', 54200, 24, 18, 5, 8);
    insertPilot.run('fox', bHash, 'Star Fox McCloud', 'pilot_2', 'Interceptor', 'Commander', 36200, 19, 14, 4, 6);
    insertPilot.run('valkyrie', bHash, 'Nova Valkyrie', 'pilot_3', 'Phantom Recon', 'Lieutenant', 28900, 12, 9, 3, 5);
} else {
    // Seamless database migration: upgrade demo pilots from legacy SHA-256 to BCrypt if needed
    try {
        const demoAccounts = ['shepard', 'fox', 'valkyrie'];
        const updateHashStmt = db.prepare('UPDATE users SET password_hash = ? WHERE username = ?');
        const bHash = bcrypt.hashSync('Password123!', 10);
        for (const uname of demoAccounts) {
            const u = db.prepare('SELECT password_hash FROM users WHERE username = ?').get(uname);
            if (u && !u.password_hash.startsWith('$2a$') && !u.password_hash.startsWith('$2b$')) {
                updateHashStmt.run(bHash, uname);
                console.log(`[AUTH MIGRATION] Upgraded ${uname} to salted BCrypt hash.`);
            }
        }
    } catch (err) {
        console.warn('[AUTH MIGRATION] Notice:', err.message);
    }
}

// Seed richer mission history if scores count is low
const scoreCount = db.prepare('SELECT COUNT(*) as count FROM scores').get().count;
if (scoreCount <= 4) {
    const insertScore = db.prepare(`
        INSERT INTO scores (user_id, pilot_name, score, level_reached, enemies_destroyed, banana_puzzles_completed, accuracy_percentage, ship_class, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

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
}

// -----------------------------------------------------------------------------
// Rank & Level Helpers
// -----------------------------------------------------------------------------
function calculateRank(score) {
    if (score >= 50000) return 'Fleet Admiral';
    if (score >= 30000) return 'Commander';
    if (score >= 15000) return 'Lieutenant';
    if (score >= 5000) return 'Ensign';
    return 'Cadet';
}

function getPilotLevelAndSector(userId, totalScore) {
    const pilotLevel = Math.max(1, Math.floor((Number(totalScore) || 0) / 5000) + 1);
    let maxSector = 1;
    let currentLevel = 1;

    if (userId) {
        try {
            const userRow = db.prepare('SELECT current_level, max_sector FROM users WHERE id = ?').get(userId);
            if (userRow) {
                currentLevel = Math.max(1, Number(userRow.current_level) || 1);
                maxSector = Math.max(1, Number(userRow.max_sector) || 1);
            }
            const row = db.prepare('SELECT MAX(level_reached) as maxLevel FROM scores WHERE user_id = ?').get(userId);
            if (row && row.maxLevel) maxSector = Math.max(maxSector, Number(row.maxLevel));
        } catch (_) { }
    }
    return { pilotLevel, maxSector, currentLevel };
}

// -----------------------------------------------------------------------------
// Virtual Identity & Session Management Subsystem
// -----------------------------------------------------------------------------
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24-hour expiration
const COOKIE_NAME = 'galaxy_pilot_session';

/**
 * Returns cookie configuration matching security best practices:
 * - httpOnly: true (prevents client-side script theft/XSS)
 * - secure: true in production (requires HTTPS), false in local development
 * - sameSite: 'lax' (guards against CSRF while enabling normal navigation)
 */
function getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        maxAge: SESSION_TTL_MS,
        path: '/'
    };
}

/**
 * Creates a server-side session in SQLite with an expiration timestamp.
 */
function createSession(userId, req) {
    // Proactively clean up expired sessions
    try {
        db.prepare("DELETE FROM sessions WHERE datetime(expires_at) <= datetime('now')").run();
    } catch (_) { }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const ip = req.ip || req.connection?.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';

    db.prepare(`
        INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?)
    `).run(token, userId, expiresAt, ip, userAgent);

    return { token, expiresAt };
}

/**
 * Removes a session token from SQLite upon logout.
 */
function destroySession(token) {
    if (!token) return;
    try {
        db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
    } catch (_) { }
}

/**
 * Extracts session token from either HTTP-only cookie or Authorization header.
 */
function extractSessionToken(req) {
    if (req.cookies && req.cookies[COOKIE_NAME]) {
        return req.cookies[COOKIE_NAME];
    }
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    return null;
}

/**
 * Middleware: Optional session authentication.
 * Attaches req.user and req.session if a valid, non-expired session exists.
 */
function authenticateSession(req, res, next) {
    const token = extractSessionToken(req);
    if (!token) {
        req.user = null;
        req.session = null;
        return next();
    }

    try {
        const row = db.prepare(`
            SELECT s.id as session_id, s.expires_at, u.*
            FROM sessions s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = ? AND datetime(s.expires_at) > datetime('now')
        `).get(token);

        if (row) {
            req.user = {
                id: row.id,
                username: row.username,
                callsign: row.callsign,
                avatar: row.avatar,
                ship_class: row.ship_class,
                rank: row.rank,
                total_score: row.total_score,
                banana_solved: row.banana_solved,
                games_played: row.games_played,
                current_level: row.current_level,
                max_sector: row.max_sector
            };
            req.session = {
                id: row.session_id,
                expires_at: row.expires_at
            };
        } else {
            req.user = null;
            req.session = null;
        }
    } catch (err) {
        req.user = null;
        req.session = null;
    }
    next();
}

/**
 * Middleware: Strict authentication requirement.
 * Rejects unauthenticated requests with HTTP 401 Unauthorized.
 */
function requireAuth(req, res, next) {
    authenticateSession(req, res, () => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                status: 'error',
                code: 'UNAUTHORIZED',
                message: 'Authentication required. Valid pilot session cookie or token not found or expired.'
            });
        }
        next();
    });
}

// -----------------------------------------------------------------------------
// REST API Endpoints
// -----------------------------------------------------------------------------

// 1. Health Status & Environment Telemetry
app.get('/api/status', (req, res) => {
    let gitInfo = { initialized: false, branch: 'unknown', commitCount: 0 };
    try {
        const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd(), timeout: 2000 }).toString().trim();
        const count = parseInt(execSync('git rev-list --count HEAD', { cwd: process.cwd(), timeout: 2000 }).toString().trim(), 10);
        gitInfo = { initialized: true, branch, commitCount: isNaN(count) ? 0 : count };
    } catch (_) { }

    res.json({
        success: true,
        status: 'success',
        service: 'Galaxy Defender React-SQLite Backend',
        version: '3.1.0',
        database: 'SQLite 3 (Embedded with WAL)',
        auth: {
            algorithm: 'BCrypt (10 salt rounds)',
            session_storage: 'SQLite server-side sessions table',
            cookie: {
                name: COOKIE_NAME,
                httpOnly: true,
                sameSite: 'lax',
                expiration_hours: 24
            }
        },
        interoperability_ready: true,
        git: gitInfo,
        timestamp: new Date().toISOString()
    });
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
                    success: true,
                    status: 'success',
                    data: {
                        question: data.question,
                        solution: Number(data.solution),
                        source: 'Dr. Marc Conrad Banana API Gateway (REST)',
                        provider: 'live_network'
                    }
                });
            }
        }
    } catch (e) {
        console.warn('[INTEROPERABILITY] Live API fetch failed, engaging procedural fallback:', e.message);
    }

    // Procedural Fallback Cipher if university server is unreachable
    const fallbackSolution = Math.floor(Math.random() * 10);
    res.json({
        success: true,
        status: 'success',
        data: {
            question: 'SIMULATED_PROCEDURAL_CIPHER',
            solution: fallbackSolution,
            source: 'Procedural Neural Cipher (Interoperability Fallback)',
            provider: 'server_procedural_simulation',
            isFallback: true
        }
    });
});

// 3. Virtual Identity: Pilot Login (BCrypt password verification + Server-side sessions)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Backend Input Validation
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            success: false,
            status: 'error',
            message: 'Username / Callsign and security passcode are required.'
        });
    }

    const cleanInput = username.trim();
    if (!cleanInput) {
        return res.status(400).json({
            success: false,
            status: 'error',
            message: 'Username or Callsign cannot be empty.'
        });
    }

    // Allow login by either username OR callsign, case-insensitive
    const user = db.prepare(`
        SELECT * FROM users
        WHERE LOWER(username) = LOWER(?) OR LOWER(callsign) = LOWER(?)
    `).get(cleanInput, cleanInput);

    if (!user) {
        // Run dummy BCrypt compare to mitigate timing-based user enumeration attacks
        bcrypt.compareSync(password, '$2b$10$e8w67wK1q7e8a3b5c7d9eO1z2y3x4w5v6u7t8s9r0q1p2o3n4m5l6');
        return res.status(401).json({
            success: false,
            status: 'error',
            message: 'Invalid callsign/username or security passcode.'
        });
    }

    // Password verification using salted BCrypt
    let passwordValid = false;
    const isBcrypt = user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$');

    if (isBcrypt) {
        passwordValid = bcrypt.compareSync(password, user.password_hash);
    } else {
        // Backward-compatible check for legacy SHA-256 or plaintext passwords
        const hash = crypto.createHash('sha256').update(password).digest('hex');
        const hashTrimmed = crypto.createHash('sha256').update(String(password).trim()).digest('hex');
        if (user.password_hash === hash || user.password_hash === hashTrimmed || user.password_hash === password) {
            passwordValid = true;
            // Transparently upgrade to modern salted BCrypt hash
            try {
                const modernHash = bcrypt.hashSync(password, 10);
                db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(modernHash, user.id);
                console.log(`[AUTH] Seamlessly upgraded pilot #${user.id} (${user.username}) password to BCrypt.`);
            } catch (_) { }
        }
    }

    if (!passwordValid) {
        return res.status(401).json({
            success: false,
            status: 'error',
            message: 'Invalid callsign/username or security passcode.'
        });
    }

    // Update last login timestamp
    db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Create server-side session in SQLite
    const session = createSession(user.id, req);

    // Set secure, HTTP-only cookie
    res.cookie(COOKIE_NAME, session.token, getCookieOptions());

    const progress = getPilotLevelAndSector(user.id, user.total_score);

    res.json({
        success: true,
        status: 'success',
        data: {
            token: session.token,
            expiresAt: session.expiresAt,
            user: {
                id: user.id,
                username: user.username,
                callsign: user.callsign,
                avatar: user.avatar,
                shipClass: user.ship_class,
                rank: user.rank,
                pilotLevel: progress.pilotLevel,
                maxSector: progress.maxSector,
                currentLevel: progress.currentLevel,
                totalScore: user.total_score,
                bananaSolved: user.banana_solved,
                gamesPlayed: user.games_played
            }
        },
        message: `Welcome aboard, ${user.callsign}.`
    });
});

// 4. Virtual Identity: Pilot Registration (BCrypt salted hashing + Session cookie)
app.post('/api/register', (req, res) => {
    const { username, callsign, password, avatar = 'pilot_1', shipClass = 'Interceptor' } = req.body;

    // Backend Input Validation
    if (!username || typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ success: false, status: 'error', message: 'Username is required.' });
    }
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
        return res.status(400).json({ success: false, status: 'error', message: 'Username must be between 3 and 30 characters.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ success: false, status: 'error', message: 'Security passcode must be at least 6 characters long.' });
    }

    const finalCallsign = (callsign && typeof callsign === 'string' && callsign.trim())
        ? callsign.trim()
        : `Pilot ${cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1)}`;

    const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(callsign) = LOWER(?)').get(cleanUsername, finalCallsign);
    if (existing) {
        return res.status(409).json({ success: false, status: 'error', message: 'Callsign or username is already registered in the fleet database.' });
    }

    // Secure BCrypt password hashing (10 salt rounds)
    const passwordHash = bcrypt.hashSync(password, 10);

    const result = db.prepare(`
        INSERT INTO users (username, password_hash, callsign, avatar, ship_class, rank, total_score, games_played, banana_solved, current_level, max_sector)
        VALUES (?, ?, ?, ?, ?, 'Cadet', 1500, 1, 1, 1, 1)
    `).run(cleanUsername, passwordHash, finalCallsign, avatar, shipClass);

    const newUserId = result.lastInsertRowid;

    // Record initial commissioning flight into scores table
    db.prepare(`
        INSERT INTO scores (user_id, pilot_name, score, level_reached, enemies_destroyed, banana_puzzles_completed, accuracy_percentage, ship_class)
        VALUES (?, ?, 1500, 1, 5, 1, 75.0, ?)
    `).run(newUserId, finalCallsign, shipClass);

    // Create server-side session in SQLite
    const session = createSession(newUserId, req);

    // Set secure HTTP-only cookie
    res.cookie(COOKIE_NAME, session.token, getCookieOptions());

    res.json({
        success: true,
        status: 'success',
        data: {
            id: newUserId,
            user_id: newUserId,
            username: cleanUsername,
            callsign: finalCallsign,
            avatar,
            shipClass,
            rank: 'Cadet',
            pilotLevel: 1,
            maxSector: 1,
            currentLevel: 1,
            totalScore: 1500,
            gamesPlayed: 1,
            bananaSolved: 1,
            token: session.token,
            expiresAt: session.expiresAt
        },
        message: `Welcome aboard, ${finalCallsign}. Pilot identity successfully commissioned.`
    });
});

// 5. Virtual Identity: Current Session Verification (Protected)
app.get('/api/auth/me', requireAuth, (req, res) => {
    const progress = getPilotLevelAndSector(req.user.id, req.user.total_score);
    res.json({
        success: true,
        status: 'success',
        data: {
            authenticated: true,
            session: {
                id: req.session.id,
                expiresAt: req.session.expires_at
            },
            user: {
                id: req.user.id,
                username: req.user.username,
                callsign: req.user.callsign,
                avatar: req.user.avatar,
                shipClass: req.user.ship_class,
                rank: req.user.rank,
                pilotLevel: progress.pilotLevel,
                maxSector: progress.maxSector,
                currentLevel: progress.currentLevel,
                totalScore: req.user.total_score,
                bananaSolved: req.user.banana_solved,
                gamesPlayed: req.user.games_played
            }
        }
    });
});

// 6. Virtual Identity: Secure Logout (Session Revocation & Cookie Clear)
app.post('/api/logout', (req, res) => {
    const token = extractSessionToken(req);
    if (token) {
        destroySession(token);
    }
    res.clearCookie(COOKIE_NAME, getCookieOptions());
    res.clearCookie('galaxy_pilot_callsign', { path: '/' });
    res.json({
        success: true,
        status: 'success',
        message: 'Pilot session terminated successfully. Secure cookie revoked.'
    });
});

// 7. Telemetry & Global Leaderboard Table
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
        success: true,
        status: 'success',
        data: { leaderboard: rows }
    });
});

// 8. Personal Pilot Mission History Table (Protected with Authorization Validation)
app.get('/api/user-records/:userId', requireAuth, (req, res) => {
    const targetUserId = Number(req.params.userId);
    if (!targetUserId) {
        return res.status(400).json({ success: false, status: 'error', message: 'Valid Pilot User ID required.' });
    }

    // Authorization validation: ensure pilots can only query their own private flight telemetry
    if (req.user.id !== targetUserId) {
        return res.status(403).json({
            success: false,
            status: 'error',
            code: 'FORBIDDEN',
            message: 'Access denied. Pilots may only access their personal flight telemetry dossiers.'
        });
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
    `).all(targetUserId);

    res.json({
        success: true,
        status: 'success',
        data: { records: rows }
    });
});

// 9. Save Pilot Current Level & Max Sector (Protected Feature)
app.post('/api/save-level', requireAuth, (req, res) => {
    const { level } = req.body;
    if (!level) {
        return res.status(400).json({ success: false, status: 'error', message: 'Target sector level required.' });
    }

    // Always enforce the authenticated user's ID from server session
    const userId = req.user.id;
    const cleanLevel = Math.max(1, Number(level) || 1);

    try {
        db.prepare(`
            UPDATE users
            SET current_level = ?,
                max_sector = MAX(COALESCE(max_sector, 1), ?)
            WHERE id = ?
        `).run(cleanLevel, cleanLevel, userId);

        res.json({
            success: true,
            status: 'success',
            currentLevel: cleanLevel,
            message: `Sector ${cleanLevel} progress saved for pilot ${req.user.callsign}.`
        });
    } catch (err) {
        res.status(500).json({ success: false, status: 'error', message: err.message });
    }
});

// 10. Submit Score (Session-Aware Telemetry Recording)
app.post('/api/submit-score', authenticateSession, (req, res) => {
    const { score, levelReached, enemiesDestroyed, bananaSolved = 0, accuracy = 0, shipClass = 'Interceptor' } = req.body;

    // Prevent spoofing: if request is authenticated, use verified user ID; otherwise null (guest)
    const userId = req.user ? req.user.id : null;
    const pilotName = req.user ? req.user.callsign : (req.body.pilotName || 'Guest Vanguard');
    const finalShipClass = req.user ? (req.user.ship_class || shipClass) : shipClass;

    db.prepare(`
        INSERT INTO scores (user_id, pilot_name, score, level_reached, enemies_destroyed, banana_puzzles_completed, accuracy_percentage, ship_class)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, pilotName, Number(score) || 0, levelReached || 1, enemiesDestroyed || 0, bananaSolved || 0, accuracy || 0, finalShipClass);

    // If registered pilot with verified session, update career stats
    if (userId) {
        const user = db.prepare('SELECT total_score, banana_solved, games_played FROM users WHERE id = ?').get(userId);
        if (user) {
            const newTotal = user.total_score + (Number(score) || 0);
            const newRank = calculateRank(newTotal);
            const cleanLevel = Math.max(1, Number(levelReached) || 1);

            db.prepare(`
                UPDATE users
                SET total_score = ?,
                    banana_solved = banana_solved + ?,
                    games_played = games_played + 1,
                    rank = ?,
                    current_level = ?,
                    max_sector = MAX(COALESCE(max_sector, 1), ?)
                WHERE id = ?
            `).run(newTotal, Number(bananaSolved) || 0, newRank, cleanLevel, cleanLevel, userId);
        }
    }

    res.json({ success: true, status: 'success', message: 'Mission debrief telemetry recorded.' });
});

// Serve frontend build in production
if (fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    // Express 5 wildcard routing
    app.get('/{*path}', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`[API SERVER] Express + SQLite backend running on http://localhost:${PORT}`);
});
