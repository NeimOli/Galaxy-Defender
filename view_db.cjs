const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'galaxy_defender.sqlite');
console.log('\n======================================================');
console.log('🛸 GALAXY DEFENDER — SQLite Database Inspector');
console.log('📁 Database File:', dbPath);
console.log('======================================================\n');

try {
    const db = new Database(dbPath, { readonly: true });

    console.log('📌 1. USERS TABLE (Pilots & Virtual Identities)');
    const users = db.prepare('SELECT id, username, callsign, rank, current_level, max_sector, total_score, games_played FROM users LIMIT 10').all();
    console.table(users);

    console.log('\n📌 2. SCORES TABLE (Flight Logs & Telemetry)');
    const scores = db.prepare('SELECT id, pilot_name, score, level_reached, accuracy_percentage, enemies_destroyed, ship_class, recorded_at FROM scores ORDER BY score DESC LIMIT 10').all();
    console.table(scores);

    console.log('\n📌 3. BANANA API LOGS (Interoperability Cache)');
    const logs = db.prepare('SELECT id, solution_expected, fetched_at FROM banana_api_logs ORDER BY id DESC LIMIT 5').all();
    console.table(logs);

    console.log('\n✅ SQLite database is healthy and fully operational.\n');
} catch (err) {
    console.error('Error reading SQLite database:', err.message);
}
