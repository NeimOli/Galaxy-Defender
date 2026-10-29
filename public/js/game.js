/**
 * ====================================================================
 * Galaxy Defender — Core Game Engine
 * Themes Demonstrated:
 *  - Event-Driven Programming (Custom EventBus, DOM listeners, loop ticks)
 *  - Interoperability (Live Banana API invocation & solution verification)
 *  - Virtual Identity (Pilot state, military rank, telemetry tracking)
 * ====================================================================
 */

// -----------------------------------------------------------------------------
// 1. Procedural Web Audio API Synthesizer (Zero-Dependency Sound Engine)
// -----------------------------------------------------------------------------
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported.');
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    playLaser(level = 1) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const baseFreq = 880 + level * 120;
        osc.type = level > 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playExplosion(isLarge = false) {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const duration = isLarge ? 0.6 : 0.25;

        // White noise generator
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(isLarge ? 400 : 800, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + duration);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(isLarge ? 0.4 : 0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + duration);
    }

    playPlayerExplosion() {
        this.playExplosion(true);
    }

    playShieldHit() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playPowerUp() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.05);

            gain.gain.setValueAtTime(0.18, now + idx * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.05);
            osc.stop(now + idx * 0.05 + 0.12);
        });
    }

    playBomb() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.8);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
        this.playExplosion(true);
    }

    playBossShoot() {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.18);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
    }

    playVictory() {
        if (this.isMuted || !this.ctx) return;
        const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        chords.forEach((freq, idx) => {
            const now = this.ctx.currentTime + idx * 0.09;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        });
    }
}

// -----------------------------------------------------------------------------
// 2. High-Performance Particle & Visual Effects Engine
// -----------------------------------------------------------------------------
class ParticleEngine {
    constructor() {
        this.particles = [];
        this.floatingTexts = [];
    }

    addThruster(x, y, vx, vy, color) {
        this.particles.push({
            x, y, vx, vy,
            color,
            radius: Math.random() * 2.5 + 1.5,
            alpha: 1,
            decay: Math.random() * 0.06 + 0.04
        });
    }

    addExplosion(x, y, color = '#ff0055', count = 22, maxSpeed = 4.5) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * maxSpeed + 1;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color,
                radius: Math.random() * 3 + 1.5,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    addFloatingText(text, x, y, color = '#00ffcc') {
        this.floatingTexts.push({
            text, x, y, color,
            alpha: 1,
            vy: -1.2,
            life: 45
        });
    }

    update() {
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Floating texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const t = this.floatingTexts[i];
            t.y += t.vy;
            t.life--;
            t.alpha = t.life / 45;
            if (t.life <= 0) {
                this.floatingTexts.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.save();
        // Draw particles
        for (const p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.fill();
        }

        // Draw floating texts
        ctx.font = 'bold 15px "Orbitron", monospace';
        ctx.textAlign = 'center';
        for (const t of this.floatingTexts) {
            ctx.fillStyle = t.color;
            ctx.globalAlpha = Math.max(0, t.alpha);
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 8;
            ctx.fillText(t.text, t.x, t.y);
        }
        ctx.restore();
    }
}

// -----------------------------------------------------------------------------
// 3. Parallax Starfield & Nebula Background Engine
// -----------------------------------------------------------------------------
class Starfield {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.stars = [];
        this.initStars();
    }

    initStars() {
        this.stars = [];
        // Crisp, natural starfield palette (diamond white, soft ice-blue, warm amber)
        const starColors = ['#ffffff', '#f1f5f9', '#e0f2fe', '#bae6fd', '#38bdf8', '#fef3c7', '#fde68a'];
        const count = 150;
        for (let i = 0; i < count; i++) {
            const layer = i < 60 ? 0 : i < 110 ? 1 : 2; // 0=distant, 1=mid, 2=near
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: layer === 0 ? Math.random() * 0.7 + 0.3
                       : layer === 1 ? Math.random() * 1.2 + 0.6
                       : Math.random() * 1.8 + 0.9,
                speed: layer === 0 ? Math.random() * 0.4 + 0.2
                      : layer === 1 ? Math.random() * 1.0 + 0.6
                      : Math.random() * 2.2 + 1.2,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: Math.random() * 0.035 + 0.02,
                color: starColors[Math.floor(Math.random() * starColors.length)],
                layer
            });
        }
    }

    resize(width, height) {
        this.width = width;
        this.height = height;
        this.initStars();
    }

    update() {
        for (const s of this.stars) {
            s.y += s.speed;
            s.twinkle += s.twinkleSpeed;
            if (s.y > this.height) {
                s.y = -s.radius;
                s.x = Math.random() * this.width;
            }
        }
    }

    draw(ctx) {
        // Deep obsidian-slate backdrop
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0,   '#050811');
        bgGrad.addColorStop(0.5, '#080d1a');
        bgGrad.addColorStop(1,   '#04070e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.save();

        // Subtle soft azure ambient cloud
        const neb1 = ctx.createRadialGradient(
            this.width * 0.70, this.height * 0.30, 20,
            this.width * 0.70, this.height * 0.30, 360
        );
        neb1.addColorStop(0,   'rgba(56, 189, 248, 0.10)');
        neb1.addColorStop(0.6, 'rgba(14, 165, 233, 0.04)');
        neb1.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = neb1;
        ctx.fillRect(0, 0, this.width, this.height);

        // Subtle indigo dust on lower left
        const neb2 = ctx.createRadialGradient(
            this.width * 0.25, this.height * 0.75, 10,
            this.width * 0.25, this.height * 0.75, 300
        );
        neb2.addColorStop(0,   'rgba(99, 102, 241, 0.08)');
        neb2.addColorStop(0.5, 'rgba(79, 70, 229, 0.03)');
        neb2.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = neb2;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw stars with clean soft shimmer
        for (const s of this.stars) {
            const alpha = 0.40 + Math.sin(s.twinkle) * 0.35;
            ctx.globalAlpha = Math.max(0.1, Math.min(1, alpha));

            if (s.layer === 2 && s.radius > 1.4) {
                ctx.shadowColor = s.color;
                ctx.shadowBlur = 4;
            } else {
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = s.color;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
        ctx.restore();
    }
}

// -----------------------------------------------------------------------------
// 4. Main Game Engine Controller
// -----------------------------------------------------------------------------
class GameEngine {
    constructor() {
        // Canvas & Context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Dimensions
        this.width = 800;
        this.height = 700;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Subsystems
        this.audio = new SoundEngine();
        this.particles = new ParticleEngine();
        this.starfield = new Starfield(this.width, this.height);
        this.player = new Player(this.width, this.height);

        // Entities
        this.playerBullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerUps = [];
        this.boss = null;

        // Game State
        this.state = 'MENU'; // 'MENU', 'PLAYING', 'PAUSED', 'BANANA_CHALLENGE', 'GAME_OVER', 'VICTORY'
        this.score = 0;
        this.highScore = 0;
        this.level = 1;
        this.enemiesDestroyed = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.bananaSolved = 0;
        this.survivalTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.screenShake = 0;

        // Wave & Spawning Director
        this.waveTimer = 0;
        this.waveThreshold = 600; // frames before boss appears
        this.spawnCooldown = 0;

        // Active Banana API Challenge State
        this.currentBananaPuzzle = null;

        // Input Controller State
        this.keys = {
            left: false,
            right: false,
            up: false,
            down: false,
            shoot: false
        };

        // Initialize systems
        this.initEventListeners();
        this.initHUD();
        this.loadPilotProfile();

        // Start render loop
        requestAnimationFrame(() => this.loop());
    }

    // -------------------------------------------------------------------------
    // Event-Driven Programming: Input & Custom Events
    // -------------------------------------------------------------------------
    initEventListeners() {
        // Fullscreen toggle helper for laptop / desktop immersion
        const expandSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>';
        const shrinkSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M4 10h6m0 0V4m0 6L3 3m17 7h-6m0 0V4m0 6l7-7"/></svg>';

        const updateFullscreenUI = () => {
            const btnFs = document.getElementById('btnFullscreen');
            if (btnFs) {
                btnFs.innerHTML = document.fullscreenElement ? `${shrinkSvg} <span>Windowed</span>` : `${expandSvg} <span>Fullscreen</span>`;
            }
        };

        const toggleFullscreen = () => {
            const gameWrapper = document.querySelector('.game-wrapper');
            if (!document.fullscreenElement) {
                if (gameWrapper && gameWrapper.requestFullscreen) {
                    gameWrapper.requestFullscreen().catch(() => {});
                } else if (gameWrapper && gameWrapper.webkitRequestFullscreen) {
                    gameWrapper.webkitRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
            }
        };

        const btnFullscreen = document.getElementById('btnFullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', toggleFullscreen);
        }

        document.addEventListener('fullscreenchange', updateFullscreenUI);

        // Keyboard Handlers
        window.addEventListener('keydown', (e) => {
            if (this.state === 'MENU') {
                if (e.code === 'Space' || e.code === 'Enter') {
                    this.startGame();
                    return;
                }
            }

            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = true;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = true;
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = true;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = true;
            if (e.code === 'Space') this.keys.shoot = true;

            // Fullscreen shortcut ('F')
            if (e.code === 'KeyF' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
                if (activeTag !== 'input' && activeTag !== 'textarea') {
                    toggleFullscreen();
                }
            }

            // Keyboard digits 0-9 for Banana Cipher challenge
            if (this.state === 'BANANA_CHALLENGE' && e.key >= '0' && e.key <= '9') {
                this.submitBananaAnswer(parseInt(e.key, 10), 'PLAYING');
                return;
            }

            // Mega Bomb trigger ('B')
            if (e.code === 'KeyB') {
                if (this.state === 'PLAYING') {
                    this.triggerMegaBomb();
                }
            }

            // Pause toggle ('P' or 'Escape')
            if (e.code === 'KeyP' || e.code === 'Escape') {
                if (this.state === 'PLAYING') {
                    this.pauseGame();
                } else if (this.state === 'PAUSED') {
                    this.resumeGame();
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'ArrowLeft' || e.code === 'KeyA') this.keys.left = false;
            if (e.code === 'ArrowRight' || e.code === 'KeyD') this.keys.right = false;
            if (e.code === 'ArrowUp' || e.code === 'KeyW') this.keys.up = false;
            if (e.code === 'ArrowDown' || e.code === 'KeyS') this.keys.down = false;
            if (e.code === 'Space') this.keys.shoot = false;
        });

        // Mouse and Touch Controls on Canvas
        let isTouching = false;
        const handlePointerMove = (clientX, clientY) => {
            if (this.state !== 'PLAYING') return;
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const targetX = (clientX - rect.left) * scaleX - this.player.width / 2;
            const targetY = (clientY - rect.top) * scaleY - this.player.height / 2;

            const lerpSpeed = isTouching ? 0.60 : 0.25;
            this.player.x += (targetX - this.player.x) * lerpSpeed;
            this.player.y += (targetY - this.player.y) * lerpSpeed;
            this.keys.shoot = true;
        };

        this.canvas.addEventListener('mousemove', (e) => {
            if (e.buttons === 1) handlePointerMove(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('touchstart', (e) => {
            isTouching = true;
            this.audio.init();
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (isTouching && e.touches[0]) {
                handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', () => {
            isTouching = false;
            this.keys.shoot = false;
        });

        // Safe UI Button Event Listeners
        const addClick = (id, fn) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', fn);
        };
        addClick('btnStartGame', () => this.startGame());
        addClick('btnSoundToggle', () => this.toggleSound());
        addClick('btnLeaderboard', () => this.openLeaderboard());
        addClick('btnBananaMatrix', () => this.triggerBananaChallenge('manual'));
        addClick('btnRestart', () => this.startGame());
        addClick('btnResume', () => this.resumeGame());
        addClick('btnQuit', () => this.quitToMenu());
        addClick('btnProfile', () => this.openProfileModal());

        // Mobile touch & click bomb & pause helpers
        const hudBombGroup = document.getElementById('hudBombGroup');
        if (hudBombGroup) {
            hudBombGroup.addEventListener('click', () => {
                if (this.state === 'PLAYING') this.triggerMegaBomb();
            });
        }

        const btnMobileBomb = document.getElementById('btnMobileBomb');
        if (btnMobileBomb) {
            btnMobileBomb.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.state === 'PLAYING') this.triggerMegaBomb();
            });
            btnMobileBomb.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                if (this.state === 'PLAYING') this.triggerMegaBomb();
            }, { passive: true });
        }

        const btnMobilePause = document.getElementById('btnMobilePause');
        if (btnMobilePause) {
            btnMobilePause.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.state === 'PLAYING') this.pauseGame();
                else if (this.state === 'PAUSED') this.resumeGame();
            });
        }

        // Virtual Identity Custom Event
        window.addEventListener('virtual_identity_changed', (e) => {
            this.loadPilotProfile();
        });

        // Window resize responsiveness
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        this.handleResize();
    }

    handleResize() {
        // Internal canvas pixel resolution remains constant 800x700 for physics & graphics,
        // while CSS aspect-ratio: 800 / 700 guarantees responsive scaling without stretch or clipping.
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initHUD() {
        this.updateHUD();
    }

    loadPilotProfile() {
        const user = (window.API && typeof window.API.getCurrentUser === 'function')
            ? window.API.getCurrentUser()
            : { callsign: 'Cadet', rank: 'Cadet', avatar: 'pilot_1', shipClass: 'Interceptor' };
        const callsignEl = document.getElementById('hudPilotCallsign');
        const rankEl = document.getElementById('hudPilotRank');
        const avatarEl = document.getElementById('hudPilotAvatar');

        if (callsignEl) callsignEl.textContent = user.callsign;
        if (rankEl) rankEl.textContent = user.rank || 'Cadet';
        if (avatarEl) avatarEl.className = `pilot-avatar-badge ${user.avatar || 'pilot_1'}`;

        if (this.player) {
            this.player.shipClass = user.shipClass || 'Interceptor';
        }
    }

    startGame() {
        this.audio.init();
        this.state = 'PLAYING';
        this.score = 0;
        this.level = 1;
        this.enemiesDestroyed = 0;
        this.shotsFired = 0;
        this.shotsHit = 0;
        this.bananaSolved = 0;
        this.survivalTimer = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.waveTimer = 0;
        this.boss = null;

        this.playerBullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.powerUps = [];

        this.player.reset(this.width, this.height);

        // Safe hide overlay menus
        const hide = (id) => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };
        hide('mainMenuOverlay');
        hide('gameOverOverlay');
        hide('pauseOverlay');
        hide('bananaChallengeModal');

        this.particles.addFloatingText('SECTOR 1: PERIMETER ENGAGED', this.width / 2, this.height / 2, '#00ffcc');
        this.updateHUD();
        if (this.onStateChange) this.onStateChange('PLAYING');
    }

    pauseGame() {
        this.state = 'PAUSED';
        const el = document.getElementById('pauseOverlay');
        if (el) el.classList.remove('hidden');
        if (this.onStateChange) this.onStateChange('PAUSED');
    }

    resumeGame() {
        this.state = 'PLAYING';
        const el = document.getElementById('pauseOverlay');
        if (el) el.classList.add('hidden');
        if (this.onStateChange) this.onStateChange('PLAYING');
    }

    quitToMenu() {
        this.state = 'MENU';
        const hide = (id) => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };
        const show = (id) => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); };
        hide('pauseOverlay');
        hide('gameOverOverlay');
        hide('bananaChallengeModal');
        show('mainMenuOverlay');
        if (this.onStateChange) this.onStateChange('MENU');
    }

    toggleSound() {
        this.audio.init();
        const isMuted = this.audio.toggleMute();
        const btn = document.getElementById('btnSoundToggle');
        if (btn) {
            const soundOnSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></svg>';
            const soundMutedSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';
            btn.innerHTML = isMuted ? `${soundMutedSvg} <span>Audio Muted</span>` : `${soundOnSvg} <span>Audio ON</span>`;
            btn.classList.toggle('muted', isMuted);
        }
        return isMuted;
    }

    triggerMegaBomb() {
        if (this.player.triggerMegaBomb(this.audio)) {
            this.screenShake = 25;
            this.particles.addExplosion(this.width / 2, this.height / 2, '#ffaa00', 80, 8);
            this.particles.addFloatingText('QUANTUM BANANA BOMB DETONATED!', this.width / 2, this.height * 0.4, '#ffcc00');

            // Obliterate all normal enemies and enemy bullets
            for (const enemy of this.enemies) {
                this.score += enemy.points;
                this.enemiesDestroyed++;
                this.particles.addExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ff0055', 25);
            }
            this.enemies = [];
            this.enemyBullets = [];

            // Damage boss if present
            if (this.boss) {
                this.boss.takeDamage(250);
                this.particles.addExplosion(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, '#ffcc00', 40);
            }

            this.updateHUD();
        }
    }

    // -------------------------------------------------------------------------
    // Main Game Loop (60 FPS requestAnimationFrame)
    // -------------------------------------------------------------------------
    loop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }

    update() {
        // Starfield updates regardless of pause for background ambiance
        this.starfield.update();

        if (this.state !== 'PLAYING') return;

        this.survivalTimer++;

        // Screen shake decay with floor to fully stop
        if (this.screenShake > 0.5) { this.screenShake *= 0.88; } else { this.screenShake = 0; }

        // Player shooting
        if (this.keys.shoot) {
            const newBullets = this.player.shoot(this.audio);
            if (newBullets.length > 0) {
                this.shotsFired += newBullets.length;
                this.playerBullets.push(...newBullets);
            }
        }

        // Update player
        this.player.update(this.keys, this.particles, this.audio);

        // Update player bullets
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            const b = this.playerBullets[i];
            b.update();
            if (b.isDestroyed) {
                this.playerBullets.splice(i, 1);
            }
        }

        // Wave Spawning Director
        this.waveTimer++;
        if (!this.boss) {
            // Spawn normal enemies
            this.spawnDirector();

            // Trigger boss encounter at wave threshold
            if (this.waveTimer > this.waveThreshold) {
                this.spawnBoss();
            }
        } else {
            // Boss encounter active
            this.boss.update(this.enemyBullets, this.player.x + this.player.width / 2, this.player.y, this.audio);
            if (this.boss.isDestroyed) {
                this.handleBossDefeated();
            }
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(this.enemyBullets, this.player.x + this.player.width / 2, this.player.y);

            if (e.isOffScreen(this.height, this.width)) {
                this.enemies.splice(i, 1);
            }
        }

        // Update enemy bullets
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const eb = this.enemyBullets[i];
            eb.update();
            if (eb.isDestroyed) {
                this.enemyBullets.splice(i, 1);
            }
        }

        // Update powerups
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            p.update();
            if (p.isDestroyed) {
                this.powerUps.splice(i, 1);
            }
        }

        // Collisions
        this.checkCollisions();

        // Particles & Floating text
        this.particles.update();

        // Combo counter timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // Update HUD
        this.updateHUD();
    }

    spawnDirector() {
        this.spawnCooldown--;
        if (this.spawnCooldown > 0) return;

        // Dynamic difficulty curve based on Sector Level
        this.spawnCooldown = Math.max(35, 75 - this.level * 8);

        const spawnRoll = Math.random();
        const randX = Math.random() * (this.width - 120) + 60;

        if (spawnRoll < 0.40) {
            // Scout Drone
            this.enemies.push(new ScoutDrone(randX, -40));
        } else if (spawnRoll < 0.65) {
            // Asteroid
            this.enemies.push(new Asteroid(randX, -50, Math.random() > 0.5 ? 'large' : 'medium'));
        } else if (spawnRoll < 0.85) {
            // Crimson Raider
            this.enemies.push(new CrimsonRaider(randX, -50));
        } else {
            // Void Bomber
            this.enemies.push(new VoidBomber(randX, -60));
        }
    }

    spawnBoss() {
        this.boss = new MothershipBoss(this.width, this.level);
        this.particles.addFloatingText('WARNING: MOTHERSHIP DREADNOUGHT INCOMING!', this.width / 2, this.height * 0.35, '#ff0055');
        this.screenShake = 15;
    }

    handleBossDefeated() {
        this.score += this.boss.points;
        this.enemiesDestroyed++;
        this.particles.addExplosion(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, '#ffaa00', 90, 8);
        this.audio.playExplosion(true);
        this.audio.playVictory();

        // Drop multiple powerups and Banana Core
        this.powerUps.push(new PowerUp(this.boss.x + this.boss.width / 2, this.boss.y + 40, 'banana'));
        this.powerUps.push(new PowerUp(this.boss.x + 30, this.boss.y + 60, 'weapon'));
        this.powerUps.push(new PowerUp(this.boss.x + this.boss.width - 30, this.boss.y + 60, 'shield'));

        this.boss = null;
        this.level++;
        this.waveTimer = 0;

        this.particles.addFloatingText(`SECTOR CLEARED! ADVANCING TO SECTOR ${this.level}`, this.width / 2, this.height / 2, '#00ffcc');

        // Automatically trigger Interoperability Banana Quantum Gate
        setTimeout(() => {
            if (this.state === 'PLAYING') {
                this.triggerBananaChallenge('sector_clear');
            }
        }, 1200);
    }

    checkCollisions() {
        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;

        // 1. Player Bullets vs Enemies
        for (let bi = this.playerBullets.length - 1; bi >= 0; bi--) {
            const b = this.playerBullets[bi];

            // Against standard enemies
            for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
                const e = this.enemies[ei];
                if (
                    b.x > e.x && b.x < e.x + e.width &&
                    b.y > e.y && b.y < e.y + e.height
                ) {
                    b.isDestroyed = true;
                    this.shotsHit++;
                    this.particles.addExplosion(b.x, b.y, b.color, 6, 2.5);

                    if (e.takeDamage(b.damage)) {
                        // Enemy killed
                        this.enemies.splice(ei, 1);
                        this.enemiesDestroyed++;
                        this.audio.playExplosion(false);
                        this.particles.addExplosion(e.x + e.width / 2, e.y + e.height / 2, '#ff0055', 20);

                        // Combo & Score
                        this.combo++;
                        this.comboTimer = 120; // 2 seconds to chain
                        const comboBonus = Math.floor(e.points * (1 + this.combo * 0.15));
                        this.score += comboBonus;
                        this.particles.addFloatingText(`+${comboBonus}`, e.x + e.width / 2, e.y, '#00ffcc');

                        // Chance to drop power-up
                        if (Math.random() < 0.22) {
                            const roll = Math.random();
                            let pType = 'shield';
                            if (roll < 0.28) pType = 'banana';
                            else if (roll < 0.55) pType = 'weapon';
                            else if (roll < 0.80) pType = 'bomb';
                            this.powerUps.push(new PowerUp(e.x + e.width / 2, e.y + e.height / 2, pType));
                        }
                    }
                    break;
                }
            }

            // Against Boss
            if (this.boss && !b.isDestroyed) {
                if (
                    b.x > this.boss.x && b.x < this.boss.x + this.boss.width &&
                    b.y > this.boss.y && b.y < this.boss.y + this.boss.height
                ) {
                    b.isDestroyed = true;
                    this.shotsHit++;
                    this.particles.addExplosion(b.x, b.y, '#ffff00', 8, 3);
                    if (this.boss.takeDamage(b.damage)) {
                        // Boss killed handled in update()
                    }
                }
            }
        }

        // 2. Enemy Bullets vs Player
        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
            const eb = this.enemyBullets[i];
            const dist = Math.hypot(eb.x - playerCenterX, eb.y - playerCenterY);
            if (dist < this.player.width * 0.45 + eb.radius) {
                eb.isDestroyed = true;
                this.screenShake = 8;
                this.particles.addExplosion(eb.x, eb.y, '#ff0055', 12);
                this.player.takeDamage(20, this.audio);
                if (this.player.lives <= 0) {
                    this.handleGameOver();
                    return;
                }
            }
        }

        // 3. Enemies colliding with Player
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            if (
                e.x < this.player.x + this.player.width &&
                e.x + e.width > this.player.x &&
                e.y < this.player.y + this.player.height &&
                e.y + e.height > this.player.y
            ) {
                e.isDestroyed = true;
                this.enemies.splice(i, 1);
                this.screenShake = 14;
                this.particles.addExplosion(e.x + e.width / 2, e.y + e.height / 2, '#ff3300', 25);
                this.player.takeDamage(35, this.audio);
                if (this.player.lives <= 0) {
                    this.handleGameOver();
                    return;
                }
            }
        }

        // 4. PowerUps collected by Player
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            const dist = Math.hypot(p.x - playerCenterX, p.y - playerCenterY);
            if (dist < this.player.width * 0.5 + p.radius) {
                p.isDestroyed = true;
                this.powerUps.splice(i, 1);
                this.audio.playPowerUp();

                if (p.type === 'shield') {
                    this.player.rechargeShield(50);
                    this.particles.addFloatingText('SHIELDS RESTORED!', p.x, p.y, '#00e5ff');
                } else if (p.type === 'weapon') {
                    const upgraded = this.player.upgradeWeapon();
                    this.particles.addFloatingText(upgraded ? 'WEAPON OVERCHARGED!' : 'MAX FIREPOWER!', p.x, p.y, '#ff007f');
                } else if (p.type === 'bomb') {
                    this.player.addBomb();
                    this.particles.addFloatingText('+1 BANANA MEGA BOMB!', p.x, p.y, '#ffaa00');
                } else if (p.type === 'banana') {
                    this.triggerBananaChallenge('drop');
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // Interoperability: Marc Conrad Banana API Challenge System
    // -------------------------------------------------------------------------
    async triggerBananaChallenge(sourceReason = 'manual') {
        const modal = document.getElementById('bananaChallengeModal');
        const imgEl = document.getElementById('bananaPuzzleImg');
        const statusEl = document.getElementById('bananaPuzzleStatus');
        const keypadContainer = document.getElementById('bananaKeypad');
        const sourceLabel = document.getElementById('bananaApiSourceLabel');

        // Pause active gameplay during decryption
        const previousState = this.state;
        this.state = 'BANANA_CHALLENGE';

        modal.classList.remove('hidden');
        imgEl.style.display = 'none';
        statusEl.innerHTML = '<div class="loader-spinner"></div> Interfacing with Marc Conrad Banana API Gateway...';
        sourceLabel.textContent = 'Contacting marcconrad.com...';

        // Render digit buttons (0 through 9)
        keypadContainer.innerHTML = '';
        for (let digit = 0; digit <= 9; digit++) {
            const btn = document.createElement('button');
            btn.className = 'keypad-btn btn-banana-digit';
            btn.textContent = digit;
            btn.addEventListener('click', () => this.submitBananaAnswer(digit, previousState));
            keypadContainer.appendChild(btn);
        }

        // Fetch puzzle from interoperability API
        try {
            const puzzle = await window.API.fetchBananaPuzzle();
            this.currentBananaPuzzle = puzzle;

            imgEl.src = puzzle.questionUrl;
            imgEl.style.display = 'block';
            statusEl.textContent = 'Solve the Banana Equation Matrix to unlock Hyperdrive Boost:';
            sourceLabel.textContent = `Interoperability Source: ${puzzle.source}`;
        } catch (err) {
            statusEl.textContent = 'Unable to establish link with Banana API. Standalone cipher active.';
        }
    }

    submitBananaAnswer(selectedDigit, returnState) {
        if (!this.currentBananaPuzzle) return;

        const statusEl = document.getElementById('bananaPuzzleStatus');
        const expected = this.currentBananaPuzzle.solution;

        if (selectedDigit === expected) {
            // Correct!
            this.bananaSolved++;
            this.score += 1500;
            this.player.rechargeShield(100);
            this.player.addBomb();
            this.audio.playVictory();

            statusEl.innerHTML = `<span style="color: #00ffcc; font-weight: bold;">DECRYPTION VERIFIED! +1,500 PTS // SHIELDS MAXED // +1 BOMB!</span>`;

            setTimeout(() => {
                document.getElementById('bananaChallengeModal').classList.add('hidden');
                this.state = 'PLAYING';
                this.particles.addFloatingText('QUANTUM BANANA BOOST ACTIVE!', this.width / 2, this.height / 2, '#ffcc00');
            }, 1200);
        } else {
            // Incorrect
            statusEl.innerHTML = `<span style="color: #ff3366;">DECRYPTION FAILED. (Answer was ${expected}). Try again next sector!</span>`;
            setTimeout(() => {
                document.getElementById('bananaChallengeModal').classList.add('hidden');
                this.state = 'PLAYING';
            }, 1500);
        }
    }

    handleGameOver() {
        this.state = 'GAME_OVER';
        this.audio.playPlayerExplosion();

        // Calculate final stats
        const accuracy = this.shotsFired > 0 ? ((this.shotsHit / this.shotsFired) * 100).toFixed(1) : 0;
        const survivalSecs = Math.floor(this.survivalTimer / 60);

        // Safe populate Game Over Overlay
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText('goScore', this.score.toLocaleString());
        setText('goLevel', this.level);
        setText('goKills', this.enemiesDestroyed);
        setText('goEnemies', this.enemiesDestroyed);
        setText('goBanana', this.bananaSolved);
        setText('goAccuracy', `${accuracy}%`);
        setText('goSurvival', `${survivalSecs}s`);

        const goOverlay = document.getElementById('gameOverOverlay');
        if (goOverlay) goOverlay.classList.remove('hidden');

        if (this.onStateChange) this.onStateChange('GAME_OVER');

        // Transmit mission debrief via API (SQLite or LocalStorage telemetry)
        if (window.API && typeof window.API.submitScore === 'function') {
            window.API.submitScore({
                score: this.score,
                level: this.level,
                enemiesDestroyed: this.enemiesDestroyed,
                bananaSolved: this.bananaSolved,
                accuracy: parseFloat(accuracy),
                survivalTime: survivalSecs
            });
        }
    }

    updateHUD() {
        // Shield Bar
        const shieldBar = document.getElementById('hudShieldFill');
        if (shieldBar) {
            const shieldPct = Math.max(0, (this.player.shield / this.player.maxShield) * 100);
            shieldBar.style.width = `${shieldPct}%`;
        }

        // Lives Icons (Precision Glowing Hull SVG)
        const livesEl = document.getElementById('hudLivesContainer');
        if (livesEl) {
            let hearts = '';
            const hullSvg = '<svg class="life-heart" width="16" height="16" viewBox="0 0 24 24" fill="#00f59b"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
            for (let i = 0; i < this.player.lives; i++) {
                hearts += hullSvg;
            }
            livesEl.innerHTML = hearts || '<span style="color: #ff3366; font-size: 11px; font-weight: 800;">CRITICAL HULL</span>';
        }

        // Bombs
        const bombEl = document.getElementById('hudBombCount');
        if (bombEl) bombEl.textContent = this.player.megaBombs;

        // Score & Level
        const scoreEl = document.getElementById('hudScore');
        if (scoreEl) scoreEl.textContent = this.score.toLocaleString();

        const levelEl = document.getElementById('hudLevel');
        if (levelEl) levelEl.textContent = this.level;

        // Boss Health Bar
        const bossBarContainer = document.getElementById('bossHealthContainer');
        if (this.boss && bossBarContainer) {
            bossBarContainer.classList.remove('hidden');
            const bossFill = document.getElementById('bossHealthFill');
            const bossTitle = document.getElementById('bossHealthTitle');
            const hpPct = Math.max(0, (this.boss.hp / this.boss.maxHp) * 100);
            if (bossFill) bossFill.style.width = `${hpPct}%`;
            if (bossTitle) bossTitle.textContent = this.boss.name;
        } else if (bossBarContainer) {
            bossBarContainer.classList.add('hidden');
        }
    }

    render() {
        this.ctx.save();

        // Screen Shake
        if (this.screenShake > 0.5) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(shakeX, shakeY);
        }

        // 1. Draw Starfield & Parallax
        this.starfield.draw(this.ctx);

        // 2. Draw PowerUps
        for (const p of this.powerUps) p.draw(this.ctx);

        // 3. Draw Player Bullets
        for (const b of this.playerBullets) b.draw(this.ctx);

        // 4. Draw Enemies
        for (const e of this.enemies) e.draw(this.ctx);

        // 5. Draw Boss
        if (this.boss) this.boss.draw(this.ctx);

        // 6. Draw Enemy Bullets
        for (const eb of this.enemyBullets) eb.draw(this.ctx);

        // 7. Draw Player
        if (this.state === 'PLAYING' || this.state === 'PAUSED' || this.state === 'BANANA_CHALLENGE') {
            this.player.draw(this.ctx);
        }

        // 8. Draw Particle Explosions & Floating Text
        this.particles.draw(this.ctx);

        this.ctx.restore();
    }

    async openLeaderboard() {
        if (this.onOpenLeaderboard) {
            this.onOpenLeaderboard();
            return;
        }
        const modal = document.getElementById('leaderboardModal');
        const listEl = document.getElementById('leaderboardList');
        if (!modal || !listEl) return;
        modal.classList.remove('hidden');
        listEl.innerHTML = '<div class="loader-spinner"></div> Fetching Sector Records...';

        const scores = (window.API && typeof window.API.getLeaderboard === 'function')
            ? await window.API.getLeaderboard()
            : [];
        listEl.innerHTML = '';

        if (!scores || scores.length === 0) {
            listEl.innerHTML = '<p class="empty-state">No flight records logged yet.</p>';
            return;
        }

        scores.forEach((s, idx) => {
            const row = document.createElement('div');
            row.className = `leaderboard-item ${idx < 3 ? 'rank-top' : ''}`;
            row.innerHTML = `
                <div class="lb-rank">#${idx + 1}</div>
                <div class="lb-pilot">
                    <div class="lb-avatar ${s.avatar || 'pilot_1'}"></div>
                    <div>
                        <div class="lb-name">${s.pilot_name}</div>
                        <div class="lb-sub">${s.rank || 'Cadet'} // Sector ${s.level_reached}</div>
                    </div>
                </div>
                <div class="lb-banana">🍌 ${s.banana_puzzles_completed || 0}</div>
                <div class="lb-score">${parseInt(s.score, 10).toLocaleString()}</div>
            `;
            listEl.appendChild(row);
        });
    }

    openProfileModal() {
        if (this.onOpenProfile) {
            this.onOpenProfile();
            return;
        }
        const user = (window.API && typeof window.API.getCurrentUser === 'function')
            ? window.API.getCurrentUser()
            : { callsign: 'Cadet', username: 'guest', rank: 'Cadet', shipClass: 'Interceptor' };
        const modal = document.getElementById('profileModal');
        if (!modal) return;
        modal.classList.remove('hidden');

        const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setTxt('profCallsign', user.callsign);
        setTxt('profUsername', `@${user.username}`);
        setTxt('profRank', user.rank || 'Cadet');
        setTxt('profShip', user.shipClass || 'Interceptor');
        setTxt('profTotalScore', (user.totalScore || 0).toLocaleString());
        setTxt('profGames', user.gamesPlayed || 0);
        setTxt('profBanana', user.bananaSolved || 0);
        const avEl = document.getElementById('profAvatar');
        if (avEl) avEl.className = `pilot-avatar-large ${user.avatar || 'pilot_1'}`;

        const authBtn = document.getElementById('profAuthActionBtn');
        if (authBtn) {
            if (user.isGuest) {
                authBtn.textContent = 'Login / Commission Pilot';
            } else {
                authBtn.textContent = 'Logout (Revert to Guest)';
                authBtn.onclick = () => {
                    if (window.API) window.API.logout();
                    this.loadPilotProfile();
                    this.openProfileModal();
                };
            }
        }
    }
}

// Expose GameEngine globally
window.GameEngine = GameEngine;

// Safe immediate auto-initialization
const initGameInstance = () => {
    if (!window.game && document.getElementById('gameCanvas')) {
        try {
            window.game = new GameEngine();
        } catch (e) {
            console.warn('[GAME ENGINE] Auto-init deferred:', e);
        }
    }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initGameInstance();
} else {
    window.addEventListener('DOMContentLoaded', initGameInstance);
}

