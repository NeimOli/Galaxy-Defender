/**
 * App.jsx — Galaxy Defender Main Orchestrator
 * Wires all React components together with shared state management.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import API from './services/api.js';

import Navbar from './components/Navbar.jsx';
import TelemetryHUD from './components/TelemetryHUD.jsx';
import GameCanvas from './components/GameCanvas.jsx';
import ArchitectureModules from './components/ArchitectureModules.jsx';

import BananaModal from './components/BananaModal.jsx';
import LeaderboardModal from './components/LeaderboardModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import LoginModal from './components/LoginModal.jsx';
import RegisterModal from './components/RegisterModal.jsx';
import TestsModal from './components/TestsModal.jsx';

export default function App() {
  // ── Auth & Pilot State ────────────────────────────────────────────────────
  const [user, setUser] = useState(() => API.getCurrentUser());

  // ── Game State ────────────────────────────────────────────────────────────
  const [gameState, setGameState] = useState('MENU'); // MENU | PLAYING | PAUSED | GAME_OVER | VICTORY

  // ── HUD Telemetry ─────────────────────────────────────────────────────────
  const [hud, setHud] = useState({
    shield: 100,
    maxShield: 100,
    lives: 3,
    bombs: 2,
    score: 0,
    level: 1,
  });
  const [bossHealth, setBossHealth] = useState(null); // null | { hp, maxHp, name }

  // ── UI Controls ───────────────────────────────────────────────────────────
  const [soundMuted, setSoundMuted] = useState(false);
  const [modal, setModal] = useState(null); // 'banana' | 'leaderboard' | 'profile' | 'login' | 'register' | 'tests'

  // ── Callbacks from game engine ────────────────────────────────────────────
  const handleHudUpdate = useCallback((hudData) => {
    setHud(prev => ({ ...prev, ...hudData }));
  }, []);

  const handleBossHealth = useCallback((bh) => {
    setBossHealth(bh);
  }, []);

  const handleStateChange = useCallback((newState) => {
    setGameState(newState);
  }, []);

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
    // Fire the virtual identity event so the game engine updates its HUD
    window.dispatchEvent(new CustomEvent('virtual_identity_changed', { detail: loggedUser }));
    // Immediately open records table so pilot sees their flight history
    setModal('leaderboard');
  };

  const handleRegisterSuccess = (newUser) => {
    setUser(newUser);
    window.dispatchEvent(new CustomEvent('virtual_identity_changed', { detail: newUser }));
    // Immediately open records table showing newly commissioned pilot record
    setModal('leaderboard');
  };

  const handleLogout = () => {
    API.logout();
    const guest = API.getCurrentUser();
    setUser(guest);
    window.dispatchEvent(new CustomEvent('virtual_identity_changed', { detail: guest }));
  };

  // ── Sound toggle ──────────────────────────────────────────────────────────
  const handleSoundToggle = () => {
    setSoundMuted(m => !m);
  };

  // ── Banana Challenge reward injection ────────────────────────────────────
  const handleBananaSolve = () => {
    if (window.game) {
      window.game.bananaSolved = (window.game.bananaSolved || 0) + 1;
      window.game.score += 200;
      window.game.player.shield = Math.min(window.game.player.shield + 30, window.game.player.maxShield);
      window.game.player.megaBombs = Math.min(window.game.player.megaBombs + 1, 5);
      window.game.particles?.addFloatingText('BANANA SOLVED! +200 PTS', window.game.width / 2, window.game.height * 0.3, '#ffb703');
      window.game.audio?.playPowerUp();
      window.game.updateHUD();
    }
  };

  // ── Game controls triggered from Navbar ──────────────────────────────────
  const handleStartGame = () => {
    if (!window.game && window.GameEngine) {
      try {
        window.game = new window.GameEngine();
      } catch (e) {
        console.error('Failed to create game engine:', e);
      }
    }
    if (window.game) {
      window.game.startGame();
      setGameState('PLAYING');
    }
  };

  const handlePauseToggle = () => {
    if (!window.game) return;
    if (gameState === 'PLAYING') window.game.pauseGame();
    else if (gameState === 'PAUSED') window.game.resumeGame();
  };

  // ── Keep user in sync if API session changes externally ──────────────────
  useEffect(() => {
    const sync = () => setUser(API.getCurrentUser());
    window.addEventListener('virtual_identity_changed', sync);
    return () => window.removeEventListener('virtual_identity_changed', sync);
  }, []);

  // ── Derive overlay state from gameState ───────────────────────────────────
  const showMainMenu = gameState === 'MENU';
  const showPause = gameState === 'PAUSED';
  const showGameOver = gameState === 'GAME_OVER';
  const showVictory = gameState === 'VICTORY';
  const isPlaying = gameState === 'PLAYING';

  return (
    <div className="app-root">
      {/* ── Navigation Bar ─────────────────────────────────────────────── */}
      <Navbar
        user={user}
        soundMuted={soundMuted}
        gameState={gameState}
        onSoundToggle={handleSoundToggle}
        onOpenBanana={() => setModal('banana')}
        onOpenLeaderboard={() => setModal('leaderboard')}
        onOpenProfile={() => setModal('profile')}
        onOpenTests={() => setModal('tests')}
        onStartGame={handleStartGame}
        onPauseToggle={handlePauseToggle}
      />

      {/* ── Boss Health Bar (above canvas) ─────────────────────────────── */}
      {bossHealth && (
        <div className="boss-bar-wrap" role="progressbar" aria-label={`${bossHealth.name} health`}>
          <div className="boss-bar-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff3366">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            {bossHealth.name}
          </div>
          <div className="boss-bar-track">
            <div
              className="boss-bar-fill"
              style={{ width: `${Math.max(0, (bossHealth.hp / bossHealth.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Game Area ──────────────────────────────────────────────────── */}
      <main className="game-area">
        {/* Telemetry HUD — left panel */}
        <TelemetryHUD
          shield={hud.shield}
          maxShield={hud.maxShield}
          lives={hud.lives}
          bombs={hud.bombs}
          score={hud.score}
          level={hud.level}
          user={user}
        />

        {/* Canvas wrapper */}
        <div className="canvas-container">
          <GameCanvas
            gameState={gameState}
            onStateChange={handleStateChange}
            onHudUpdate={handleHudUpdate}
            onBossHealth={handleBossHealth}
            soundMuted={soundMuted}
            user={user}
          />

          {/* ── In-canvas Overlays ────────────────────────────────────── */}

          {/* Main Menu Overlay */}
          {showMainMenu && (
            <div className="game-overlay menu-overlay" id="mainMenuOverlay">
              <div className="overlay-emblem" aria-hidden="true">
                <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
                  <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="rgba(0,240,255,0.15)" stroke="#00f0ff" strokeWidth="1.5"/>
                  <circle cx="50" cy="50" r="18" fill="rgba(0,240,255,0.12)" stroke="#00f0ff" strokeWidth="1.2"/>
                  <polygon points="50,30 56,44 72,44 60,53 65,67 50,58 35,67 40,53 28,44 44,44" fill="#00f0ff" opacity="0.7"/>
                </svg>
              </div>
              <h1 className="overlay-title">GALAXY DEFENDER</h1>
              <p className="overlay-sub">Tactical Deep Space Defense</p>
              <div className="overlay-hint">
                <kbd>SPACE</kbd> or <kbd>ENTER</kbd> to launch
              </div>
              <button className="btn-launch" onClick={handleStartGame}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                LAUNCH MISSION
              </button>
              <p className="overlay-hint2">
                Mouse drag · Arrow keys · WASD · Touch to pilot
              </p>
            </div>
          )}

          {/* Pause Overlay */}
          {showPause && (
            <div className="game-overlay pause-overlay" id="pauseOverlay">
              <div className="overlay-icon-sm">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.8">
                  <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
              </div>
              <h2 className="overlay-title" style={{ fontSize: '1.8rem' }}>MISSION PAUSED</h2>
              <div className="overlay-btn-group">
                <button className="btn-launch" onClick={handlePauseToggle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Resume
                </button>
                <button className="btn-secondary" onClick={() => window.game?.quitToMenu()}>
                  Quit to Menu
                </button>
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {showGameOver && (
            <div className="game-overlay gameover-overlay" id="gameOverOverlay">
              <div className="overlay-icon-sm">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff3366" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h2 className="overlay-title" style={{ color: '#ff3366', fontSize: '1.8rem' }}>HULL BREACHED</h2>
              <p className="overlay-sub" style={{ color: '#ff3366' }}>Mission Failed — Sector Lost</p>
              <div className="overlay-score-final">
                Final Score: <strong>{hud.score.toLocaleString()}</strong>
              </div>
              <div className="overlay-btn-group">
                <button className="btn-launch" onClick={handleStartGame}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Retry Mission
                </button>
                <button className="btn-secondary" onClick={() => setModal('leaderboard')}>
                  Leaderboard
                </button>
              </div>
            </div>
          )}

          {/* Victory Overlay */}
          {showVictory && (
            <div className="game-overlay victory-overlay" id="victoryOverlay">
              <div className="overlay-emblem">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#ffb703">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h2 className="overlay-title" style={{ color: '#ffb703', fontSize: '1.8rem' }}>SECTOR SECURED</h2>
              <p className="overlay-sub" style={{ color: '#ffb703' }}>Victory — All Threats Eliminated</p>
              <div className="overlay-score-final">
                Final Score: <strong>{hud.score.toLocaleString()}</strong>
              </div>
              <div className="overlay-btn-group">
                <button className="btn-launch" style={{ background: 'linear-gradient(135deg, #ffb703, #ff8c00)' }} onClick={handleStartGame}>
                  Next Sector
                </button>
                <button className="btn-secondary" onClick={() => setModal('leaderboard')}>
                  Submit Score
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile touch controls */}
        <div className="mobile-controls" aria-label="Mobile controls">
          <button
            className="mob-btn mob-bomb"
            onClick={() => window.game?.triggerMegaBomb()}
            title="Detonate Mega Bomb (B)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffb703" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#ffb703"/>
            </svg>
          </button>
          <button
            className="mob-btn mob-pause"
            onClick={handlePauseToggle}
            title="Pause (P / Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2.5">
              <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
            </svg>
          </button>
        </div>
      </main>

      {/* ── Theme Cards Footer ─────────────────────────────────────────── */}
      <ArchitectureModules />

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {modal === 'banana' && (
        <BananaModal
          onClose={() => {
            setModal(null);
            if (window.game?.state === 'BANANA_CHALLENGE') {
              window.game.state = 'PLAYING';
            }
          }}
          onSolve={handleBananaSolve}
        />
      )}

      {modal === 'leaderboard' && (
        <LeaderboardModal
          onClose={() => setModal(null)}
          currentScore={hud.score}
          user={user}
          onLaunchMission={handleStartGame}
        />
      )}

      {modal === 'profile' && (
        <ProfileModal
          user={user}
          onClose={() => setModal(null)}
          onLogin={() => setModal('login')}
          onLogout={handleLogout}
        />
      )}

      {modal === 'login' && (
        <LoginModal
          onClose={() => setModal(null)}
          onSuccess={handleLoginSuccess}
          onGoRegister={() => setModal('register')}
        />
      )}

      {modal === 'register' && (
        <RegisterModal
          onClose={() => setModal(null)}
          onSuccess={handleRegisterSuccess}
        />
      )}

      {modal === 'tests' && (
        <TestsModal onClose={() => setModal(null)} />
      )}
    </div>
  );
}

