<?php
/**
 * Galaxy Defender — Enterprise Backend API
 * Course: Software for Enterprise
 * Themes Demonstrated:
 *  - Interoperability (Marc Conrad Banana API Proxy & JSON Exchange)
 *  - Virtual Identity (Pilot Authentication, Session Tokens, Password Hashing)
 *  - Event & Telemetry Logging
 */

// Strict error reporting for enterprise debugging
error_reporting(E_ALL);
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Respond to preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -----------------------------------------------------------------------------
// Database Configuration (XAMPP / MySQL Defaults)
// -----------------------------------------------------------------------------
$DB_HOST = '127.0.0.1';
$DB_PORT = 3306;
$DB_NAME = 'galaxy_defender';
$DB_USER = 'root';
$DB_PASS = '';

$pdo = null;
$dbConnected = false;

try {
    $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
    $dbConnected = true;
} catch (PDOException $e) {
    // We catch the error so we can still provide Banana API proxying even if MySQL is offline!
    $dbConnected = false;
    $dbError = $e->getMessage();
}

// -----------------------------------------------------------------------------
// Helper Response Functions
// -----------------------------------------------------------------------------
function sendResponse($status, $data = [], $message = '') {
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ]);
    exit;
}

function sendError($message, $code = 400, $data = []) {
    http_response_code($code);
    echo json_encode([
        'status' => 'error',
        'message' => $message,
        'data' => $data,
        'timestamp' => time()
    ]);
    exit;
}

// Parse request body
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true) ?? [];
$action = $_GET['action'] ?? $jsonInput['action'] ?? '';

// -----------------------------------------------------------------------------
// Action Routing
// -----------------------------------------------------------------------------

switch ($action) {
    // -------------------------------------------------------------------------
    // 1. Interoperability: Marc Conrad Banana API Proxy
    // -------------------------------------------------------------------------
    case 'banana':
    case 'banana_puzzle':
        handleBananaApiProxy($pdo);
        break;

    // -------------------------------------------------------------------------
    // 2. Health & Diagnostic Check
    // -------------------------------------------------------------------------
    case 'ping':
    case 'status':
        sendResponse('success', [
            'service' => 'Galaxy Defender Enterprise API',
            'version' => '2.0.0',
            'database_connected' => $dbConnected,
            'interoperability_banana_ready' => true,
            'time' => date('Y-m-d H:i:s')
        ], 'API backend is operational.');
        break;

    // -------------------------------------------------------------------------
    // 3. Virtual Identity: Player Registration
    // -------------------------------------------------------------------------
    case 'register':
        if (!$dbConnected) {
            sendError('Database offline. Virtual Identity registration requires active MySQL database.', 503);
        }
        handleRegister($pdo, $jsonInput);
        break;

    // -------------------------------------------------------------------------
    // 4. Virtual Identity: Player Login
    // -------------------------------------------------------------------------
    case 'login':
        if (!$dbConnected) {
            sendError('Database offline. Virtual Identity login requires active MySQL database.', 503);
        }
        handleLogin($pdo, $jsonInput);
        break;

    // -------------------------------------------------------------------------
    // 5. Leaderboard: Retrieve High Scores
    // -------------------------------------------------------------------------
    case 'get_leaderboard':
        if (!$dbConnected) {
            sendError('Database offline. Leaderboard requires active MySQL connection.', 503);
        }
        handleGetLeaderboard($pdo);
        break;

    // -------------------------------------------------------------------------
    // 6. Leaderboard: Submit Mission Score
    // -------------------------------------------------------------------------
    case 'submit_score':
        if (!$dbConnected) {
            sendError('Database offline. Score submission requires active MySQL connection.', 503);
        }
        handleSubmitScore($pdo, $jsonInput);
        break;

    // -------------------------------------------------------------------------
    // 7. Pilot History: Mission Flight Logs
    // -------------------------------------------------------------------------
    case 'get_history':
        if (!$dbConnected) {
            sendError('Database offline.', 503);
        }
        handleGetHistory($pdo, $jsonInput);
        break;

    // -------------------------------------------------------------------------
    // 8. Virtual Identity: Pilot Logout & Cookie Invalidation (Week 5)
    // -------------------------------------------------------------------------
    case 'logout':
        setcookie('galaxy_pilot_session', '', time() - 3600, '/');
        setcookie('galaxy_pilot_callsign', '', time() - 3600, '/');
        sendResponse('success', [], 'Pilot session cookies invalidated successfully.');
        break;

    default:
        sendError('Invalid API action specified.', 400, ['available_actions' => [
            'banana', 'status', 'register', 'login', 'get_leaderboard', 'submit_score', 'get_history'
        ]]);
        break;
}

// -----------------------------------------------------------------------------
// Controller Implementations
// -----------------------------------------------------------------------------

/**
 * Interoperability: Fetches real-time puzzle from Dr. Marc Conrad's Banana API
 * Endpoints: https://marcconrad.com/uob/banana/api.php?out=json
 * Serves as an enterprise gateway / CORS proxy with fallback telemetry.
 */
function handleBananaApiProxy($pdo) {
    $apiUrl = 'https://marcconrad.com/uob/banana/api.php?out=json';
    $httpFallbackUrl = 'http://marcconrad.com/uob/banana/api.php?out=json';

    $context = stream_context_create([
        'http' => [
            'timeout' => 5,
            'user_agent' => 'GalaxyDefender-InteroperabilityEngine/1.0'
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);

    $raw = @file_get_contents($apiUrl, false, $context);
    if ($raw === false) {
        $raw = @file_get_contents($httpFallbackUrl, false, $context);
    }

    if ($raw !== false) {
        $data = json_decode($raw, true);
        if (isset($data['question']) && isset($data['solution'])) {
            // Log telemetry if database is available
            if ($pdo) {
                try {
                    $stmt = $pdo->prepare("INSERT INTO banana_api_logs (puzzle_url, solution_expected) VALUES (?, ?)");
                    $stmt->execute([$data['question'], (int)$data['solution']]);
                } catch (Exception $e) {
                    // Suppress telemetry logging error to keep game responsive
                }
            }

            sendResponse('success', [
                'question' => $data['question'],
                'solution' => (int)$data['solution'],
                'source' => 'Marc Conrad Banana API (Live)',
                'provider' => 'marcconrad.com'
            ], 'Live Banana API puzzle retrieved successfully.');
        }
    }

    // Enterprise Fallback: Procedurally generated Banana puzzle simulation
    // Ensures seamless uninterrupted gameplay during university server downtime
    $simulatedSolution = rand(0, 9);
    sendResponse('success', [
        'question' => 'SIMULATED_BANANA_PUZZLE',
        'solution' => $simulatedSolution,
        'source' => 'Galaxy Defender Procedural Banana Matrix (Offline Fallback)',
        'provider' => 'local_simulation'
    ], 'Fallback Banana puzzle generated.');
}

/**
 * Virtual Identity: Registration Handler
 */
function handleRegister($pdo, $input) {
    $username = trim($input['username'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $callsign = trim($input['callsign'] ?? '');
    $avatar = trim($input['avatar'] ?? 'pilot_1');
    $shipClass = trim($input['ship_class'] ?? 'Interceptor');

    if (empty($username) || empty($password)) {
        sendError('Username and password are required.');
    }

    if (strlen($username) < 3 || strlen($username) > 30) {
        sendError('Username must be between 3 and 30 characters.');
    }

    if (strlen($password) < 6) {
        sendError('Password must be at least 6 characters.');
    }

    if (empty($callsign)) {
        $callsign = 'Pilot ' . ucfirst($username);
    }

    // Check if username exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        sendError('Username already registered. Please choose another callsign.');
    }

    // Secure password hashing
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $insert = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, callsign, avatar, ship_class, rank)
        VALUES (?, ?, ?, ?, ?, ?, 'Cadet')
    ");
    $insert->execute([$username, $email, $passwordHash, $callsign, $avatar, $shipClass]);
    $userId = $pdo->lastInsertId();

    sendResponse('success', [
        'user_id' => $userId,
        'username' => $username,
        'callsign' => $callsign,
        'avatar' => $avatar,
        'ship_class' => $shipClass,
        'rank' => 'Cadet'
    ], 'Pilot successfully commissioned into Galaxy Fleet.');
}

/**
 * Virtual Identity: Login Handler
 */
function handleLogin($pdo, $input) {
    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        sendError('Please provide both username and password.');
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendError('Invalid username or password credentials.');
    }

    // Update last login
    $update = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
    $update->execute([$user['id']]);

    // Generate session token (Virtual Identity)
    $token = bin2hex(random_bytes(32));

    // Week 5: Authentication & Cookies (Academic Requirement)
    // Issues secure HTTP session cookies for pilot identity persistence
    setcookie('galaxy_pilot_session', $token, [
        'expires' => time() + (86400 * 7),
        'path' => '/',
        'httponly' => false,
        'samesite' => 'Lax'
    ]);
    setcookie('galaxy_pilot_callsign', $user['callsign'], [
        'expires' => time() + (86400 * 7),
        'path' => '/',
        'httponly' => false,
        'samesite' => 'Lax'
    ]);

    sendResponse('success', [
        'token' => $token,
        'user' => [
            'id' => (int)$user['id'],
            'username' => $user['username'],
            'callsign' => $user['callsign'],
            'avatar' => $user['avatar'],
            'ship_class' => $user['ship_class'],
            'rank' => $user['rank'],
            'total_score' => (int)$user['total_score'],
            'banana_solved' => (int)$user['banana_solved'],
            'games_played' => (int)$user['games_played']
        ]
    ], 'Authentication successful. Welcome aboard, ' . $user['callsign'] . '.');
}

/**
 * Leaderboard: Return Top Scores
 */
function handleGetLeaderboard($pdo) {
    $stmt = $pdo->query("
        SELECT s.id, s.pilot_name, s.score, s.level_reached, s.enemies_destroyed, 
               s.banana_puzzles_completed, s.accuracy_percentage, s.recorded_at,
               u.avatar, u.rank
        FROM scores s
        LEFT JOIN users u ON s.user_id = u.id
        ORDER BY s.score DESC
        LIMIT 20
    ");
    $leaderboard = $stmt->fetchAll();

    sendResponse('success', [
        'leaderboard' => $leaderboard,
        'count' => count($leaderboard)
    ], 'Leaderboard retrieved successfully.');
}

/**
 * Leaderboard & Telemetry: Submit Game Mission Score
 */
function handleSubmitScore($pdo, $input) {
    $userId = isset($input['user_id']) && is_numeric($input['user_id']) ? (int)$input['user_id'] : null;
    $pilotName = trim($input['pilot_name'] ?? 'Guest Pilot');
    $score = (int)($input['score'] ?? 0);
    $level = (int)($input['level_reached'] ?? 1);
    $enemies = (int)($input['enemies_destroyed'] ?? 0);
    $bananaSolved = (int)($input['banana_puzzles_completed'] ?? 0);
    $accuracy = (float)($input['accuracy_percentage'] ?? 0);
    $survivalTime = (int)($input['survival_time_seconds'] ?? 0);

    if ($score < 0) $score = 0;

    $stmt = $pdo->prepare("
        INSERT INTO scores (user_id, pilot_name, score, level_reached, enemies_destroyed, banana_puzzles_completed, accuracy_percentage, survival_time_seconds)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$userId, $pilotName, $score, $level, $enemies, $bananaSolved, $accuracy, $survivalTime]);
    $scoreId = $pdo->lastInsertId();

    // If registered user, update career stats and rank
    if ($userId) {
        $update = $pdo->prepare("
            UPDATE users SET 
                total_score = total_score + ?,
                games_played = games_played + 1,
                banana_solved = banana_solved + ?
            WHERE id = ?
        ");
        $update->execute([$score, $bananaSolved, $userId]);

        // Evaluate military rank promotion (use prepared statement — defence-in-depth)
        $rankStmt = $pdo->prepare("SELECT total_score FROM users WHERE id = ?");
        $rankStmt->execute([$userId]);
        $userRow = $rankStmt->fetch();
        if ($userRow) {
            $newScore = (int)$userRow['total_score'];
            $rank = 'Cadet';
            if ($newScore > 50000) $rank = 'Fleet Admiral';
            elseif ($newScore > 30000) $rank = 'Commander';
            elseif ($newScore > 15000) $rank = 'Lieutenant';
            elseif ($newScore > 5000) $rank = 'Ensign';

            $rankUp = $pdo->prepare("UPDATE users SET rank = ? WHERE id = ?");
            $rankUp->execute([$rank, $userId]);
        }
    }

    sendResponse('success', [
        'score_id' => $scoreId,
        'pilot_name' => $pilotName,
        'score' => $score
    ], 'Mission debrief recorded in Galaxy Defender mainframe.');
}

/**
 * Flight History: Recent Missions
 */
function handleGetHistory($pdo, $input) {
    $userId = isset($input['user_id']) ? (int)$input['user_id'] : null;
    if (!$userId) {
        sendError('User ID is required to fetch flight history.');
    }

    $stmt = $pdo->prepare("
        SELECT score, level_reached, enemies_destroyed, banana_puzzles_completed, recorded_at
        FROM scores
        WHERE user_id = ?
        ORDER BY recorded_at DESC
        LIMIT 10
    ");
    $stmt->execute([$userId]);
    $history = $stmt->fetchAll();

    sendResponse('success', ['history' => $history]);
}
