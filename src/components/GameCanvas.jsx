/**
 * GameCanvas.jsx — Canvas Game Engine Wrapper
 * Bridges the vanilla JS GameEngine with React via useRef + useEffect.
 * Theme: Event-Driven Programming (game loop, custom events, callbacks)
 */
import { useRef, useEffect, useCallback } from 'react';

export default function GameCanvas({
  gameState,
  onStateChange,
  onHudUpdate,
  onBossHealth,
  onOpenBanana,
  soundMuted,
  user,
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  // Patch the game engine to use React callbacks instead of direct DOM writes
  const patchEngine = useCallback((engine) => {
    // Wire React HUD callback directly into game engine
    // game.js updateHUD() will call engine.onHudUpdate({...}) on every sync
    engine.onHudUpdate = function (data) {
      onHudUpdate(data);
      if (engine.boss) {
        onBossHealth({ hp: engine.boss.hp, maxHp: engine.boss.maxHp, name: engine.boss.name });
      } else {
        onBossHealth(null);
      }
    };

    // Override banana challenge to open React modal
    engine.triggerBananaChallenge = function () {
      engine.state = 'BANANA_CHALLENGE';
      if (onOpenBanana) onOpenBanana();
      else window.dispatchEvent(new CustomEvent('open_banana_challenge'));
    };

    // Override state transitions to notify React
    const origStart = engine.startGame.bind(engine);
    engine.startGame = function () {
      origStart();
      onStateChange('PLAYING');
    };

    const origPause = engine.pauseGame.bind(engine);
    engine.pauseGame = function () {
      origPause();
      onStateChange('PAUSED');
    };

    const origResume = engine.resumeGame.bind(engine);
    engine.resumeGame = function () {
      origResume();
      onStateChange('PLAYING');
    };

    const origQuit = engine.quitToMenu.bind(engine);
    engine.quitToMenu = function () {
      origQuit();
      onStateChange('MENU');
    };
  }, [onHudUpdate, onBossHealth, onStateChange, onOpenBanana]);

  // Initialize the game engine once the canvas mounts
  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamically load the game engine scripts
    // We inject them as global scripts so they can access each other
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[data-game-src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.setAttribute('data-game-src', src);
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });

    let cancelled = false;

    const init = async () => {
      try {
        // Load dependencies in order
        await loadScript('/js/player.js');
        await loadScript('/js/enemies.js');
        await loadScript('/js/game.js');

        if (cancelled) return;

        // Ensure window.game instance exists
        if (!window.game && window.GameEngine) {
          try {
            window.game = new window.GameEngine();
          } catch (err) {
            console.error('[GameCanvas] Failed to instantiate GameEngine:', err);
          }
        }

        if (window.game) {
          engineRef.current = window.game;
          patchEngine(engineRef.current);
          engineRef.current.updateHUD();
        }
      } catch (err) {
        console.error('[GameCanvas] Failed to load game engine:', err);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync sound mute state to engine
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    engine.audio.init();
    if (engine.audio.isMuted !== soundMuted) {
      engine.audio.isMuted = soundMuted;
    }
  }, [soundMuted]);

  // Expose engine control to parent via window.game (already set by game.js)
  // React just provides the canvas ref

  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        className="game-canvas"
        aria-label="Galaxy Defender game canvas"
      />
    </div>
  );
}

