<?php
/**
 * Galaxy Defender — Banana API Live Test & Evidence Page
 * =====================================================================
 * Purpose:  Evidence page for tutor to verify working Banana API
 *           interoperability with Dr. Marc Conrad's external service.
 * Access:   http://localhost/Galaxy%20Defender%20-%20Space%20Shooter%20Game/api/banana_test.php
 * =====================================================================
 */

$apiUrl     = 'https://marcconrad.com/uob/banana/api.php?out=json';
$apiUrlHttp = 'http://marcconrad.com/uob/banana/api.php?out=json';
$rawResponse = null;
$parsedData  = null;
$fetchMethod = '';
$fetchError  = '';
$responseTime = 0;
$timestamp = date('Y-m-d H:i:s');

$context = stream_context_create([
    'http' => [
        'timeout'    => 5,
        'user_agent' => 'GalaxyDefender-InteroperabilityEngine/1.0 (PHP/' . PHP_VERSION . ')',
        'header'     => "Accept: application/json\r\n"
    ],
    'ssl' => ['verify_peer' => false, 'verify_peer_name' => false]
]);

$start = microtime(true);
$rawResponse = @file_get_contents($apiUrl, false, $context);
if ($rawResponse !== false) {
    $fetchMethod = 'HTTPS Direct';
} else {
    $rawResponse = @file_get_contents($apiUrlHttp, false, $context);
    $fetchMethod = $rawResponse !== false ? 'HTTP Fallback' : 'Failed';
}
$responseTime = round((microtime(true) - $start) * 1000, 1);

if ($rawResponse !== false) {
    $parsedData = json_decode($rawResponse, true);
} else {
    $fetchError = 'Cannot reach marcconrad.com - server offline or blocking.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Banana API Evidence | Galaxy Defender</title>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Fira+Code&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#060914;color:#e6f1ff;font-family:'Inter',sans-serif;padding:30px 20px;min-height:100vh}
h1{font-family:'Orbitron',sans-serif;font-size:22px;color:#ffcc00;letter-spacing:2px;margin-bottom:4px}
.sub{font-size:12px;color:#8892b0;margin-bottom:28px}
.box{background:rgba(13,19,38,.85);border:1px solid rgba(0,229,255,.25);border-radius:10px;padding:20px 24px;margin-bottom:18px}
.box h2{font-family:'Orbitron',sans-serif;font-size:11px;color:#00e5ff;letter-spacing:1.5px;text-transform:uppercase;border-bottom:1px solid rgba(0,229,255,.15);padding-bottom:8px;margin-bottom:14px}
.row{display:flex;gap:12px;margin-bottom:8px;font-size:13px}
.row label{color:#8892b0;min-width:200px}
.row span{color:#fff;font-family:'Fira Code',monospace;font-weight:600}
.ok{color:#39ff14}.err{color:#ff3366}.warn{color:#ffcc00}
.raw{background:#000;border:1px solid rgba(0,229,255,.2);border-radius:6px;padding:14px;font-family:'Fira Code',monospace;font-size:13px;white-space:pre-wrap;color:#39ff14;max-height:200px;overflow-y:auto;margin-top:6px}
.puzzle-img{max-width:100%;border-radius:6px;border:2px solid rgba(255,204,0,.4);box-shadow:0 0 20px rgba(255,204,0,.15);margin-top:12px}
.sol{display:inline-block;font-size:36px;font-family:'Orbitron',sans-serif;color:#ffcc00;background:rgba(255,204,0,.1);border:2px solid rgba(255,204,0,.5);border-radius:8px;padding:10px 28px;margin-top:12px}
.btn{display:inline-block;padding:10px 22px;background:rgba(0,229,255,.15);border:1px solid #00e5ff;color:#fff;font-family:'Orbitron',sans-serif;font-size:11px;letter-spacing:1px;text-decoration:none;border-radius:6px;margin-top:14px;margin-right:8px;transition:.2s}
.btn:hover{background:rgba(0,229,255,.3)}
</style>
</head>
<body>
<h1>BANANA API — INTEROPERABILITY EVIDENCE</h1>
<p class="sub">Galaxy Defender // Software for Enterprise Assessment | <?= $timestamp ?></p>

<div class="box">
  <h2>API Request Details</h2>
  <div class="row"><label>Primary Endpoint:</label><span><?= htmlspecialchars($apiUrl) ?></span></div>
  <div class="row"><label>Method / Format:</label><span>HTTP GET &nbsp;|&nbsp; JSON (?out=json)</span></div>
  <div class="row"><label>Fetch Strategy Used:</label><span class="<?= $fetchMethod === 'Failed' ? 'err' : 'ok' ?>"><?= htmlspecialchars($fetchMethod ?: 'N/A') ?></span></div>
  <div class="row"><label>Response Time:</label><span><?= $responseTime ?>ms</span></div>
  <div class="row"><label>PHP Version:</label><span><?= PHP_VERSION ?></span></div>
  <div class="row"><label>Test Timestamp:</label><span><?= $timestamp ?></span></div>
</div>

<div class="box">
  <h2>Raw JSON Response</h2>
  <?php if ($rawResponse !== false): ?>
    <div class="raw"><?= htmlspecialchars($rawResponse) ?></div>
  <?php else: ?>
    <div class="raw err">ERROR: <?= htmlspecialchars($fetchError) ?>

Game fallback: Procedural HTML5 Canvas puzzle activates automatically.</div>
  <?php endif; ?>
</div>

<?php if ($parsedData): ?>
<div class="box">
  <h2>Parsed Schema Validation</h2>
  <div class="row"><label>JSON Status:</label><span class="ok">VALID — Decoded Successfully</span></div>
  <div class="row"><label>Field "question" (Image URL):</label><span><?= htmlspecialchars($parsedData['question'] ?? 'missing') ?></span></div>
  <div class="row"><label>Field "solution" (Digit 0-9):</label><span class="ok"><?= htmlspecialchars((string)($parsedData['solution'] ?? 'missing')) ?></span></div>

  <?php if (!empty($parsedData['question'])): ?>
  <div style="margin-top:14px;font-size:12px;color:#8892b0">Puzzle Image (from "question" field):</div>
  <img class="puzzle-img" src="<?= htmlspecialchars($parsedData['question']) ?>" alt="Banana Puzzle" width="430">
  <div style="margin-top:14px;font-size:12px;color:#8892b0">Correct Answer (from "solution" field):</div>
  <div class="sol"><?= (int)$parsedData['solution'] ?></div>
  <?php endif; ?>
</div>
<?php endif; ?>

<div class="box">
  <h2>Game Integration Summary</h2>
  <div class="row"><label>JS Fetch Module:</label><span>js/api.js → fetchBananaPuzzle()</span></div>
  <div class="row"><label>PHP Proxy Action:</label><span>api/api.php?action=banana</span></div>
  <div class="row"><label>DB Telemetry Log:</label><span>banana_api_logs table (MySQL)</span></div>
  <div class="row"><label>In-Game Triggers:</label><span>Boss defeat / Banana Core pickup / HUD button</span></div>
  <div class="row"><label>Solution Validation:</label><span>Player selects digit 0-9 on keypad; matched to API "solution"</span></div>
  <div class="row"><label>Correct Reward:</label><span>+1,500 pts + Shield 100% + +1 Mega Bomb</span></div>
  <div class="row"><label>Offline Fallback:</label><span>Canvas procedural math puzzle (no downtime)</span></div>
</div>

<a href="../index.html" class="btn">Return to Game</a>
<a href="?" class="btn">Fetch New Puzzle</a>

</body>
</html>
