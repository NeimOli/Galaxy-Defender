/**
 * ====================================================================
 * Galaxy Defender — Player Spacecraft Module
 * Handles:
 *  - Spaceship physics, inertia, and clamping to screen boundaries
 *  - Weapon firing systems (Single, Dual, Plasma Spread, Torpedo)
 *  - Regenerative Energy Shield & Health/Lives tracking
 *  - Dynamic Vector Graphics & Thruster Particle Generation
 * ====================================================================
 */

class Player {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Dimensions
        this.width = 46;
        this.height = 54;

        // Position & Physics
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 30;
        this.vx = 0;
        this.vy = 0;
        this.speed = 6.5;
        this.friction = 0.88;
        this.tilt = 0; // banking tilt in radians

        // Vitals
        this.lives = 3;
        this.maxShield = 100;
        this.shield = 100;
        this.shieldRegenTimer = 0;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;

        // Energy & Overdrive
        this.maxEnergy = 100;
        this.energy = 100;

        // Weapon Systems
        this.weaponLevel = 1; // 1: Blaster, 2: Twin Lasers, 3: Plasma Spread, 4: Hyper Photon
        this.fireCooldown = 0;
        this.baseFireRate = 12; // Frames between shots (~5-6 shots/sec at 60fps)
        this.megaBombs = 2; // Banana Quantum Bombs

        // Visual Flair
        this.thrusterCycle = 0;
        this.shipClass = 'Interceptor';
        this.skinColor = '#00ffcc'; // Cyan default
    }

    reset(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = canvasWidth / 2 - this.width / 2;
        this.y = canvasHeight - this.height - 30;
        this.vx = 0;
        this.vy = 0;
        this.lives = 3;
        this.shield = 100;
        this.energy = 100;
        this.weaponLevel = 1;
        this.megaBombs = 2;
        this.isInvulnerable = false;
        this.invulnerableTimer = 0;
    }

    update(inputState, particleEngine, audioSynth) {
        // Horizontal Movement
        if (inputState.left) {
            this.vx -= 1.2;
            this.tilt = Math.max(this.tilt - 0.05, -0.25);
        } else if (inputState.right) {
            this.vx += 1.2;
            this.tilt = Math.min(this.tilt + 0.05, 0.25);
        } else {
            this.tilt *= 0.8;
        }

        // Vertical Movement
        if (inputState.up) {
            this.vy -= 1.2;
        }
        if (inputState.down) {
            this.vy += 1.2;
        }

        // Apply friction & speed limit
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Clamp speed
        const currentSpeed = Math.hypot(this.vx, this.vy);
        if (currentSpeed > this.speed) {
            this.vx = (this.vx / currentSpeed) * this.speed;
            this.vy = (this.vy / currentSpeed) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;

        // Screen boundary collisions
        if (this.x < 10) { this.x = 10; this.vx = 0; }
        if (this.x + this.width > this.canvasWidth - 10) {
            this.x = this.canvasWidth - 10 - this.width;
            this.vx = 0;
        }
        if (this.y < 30) { this.y = 30; this.vy = 0; }
        if (this.y + this.height > this.canvasHeight - 20) {
            this.y = this.canvasHeight - 20 - this.height;
            this.vy = 0;
        }

        // Shield auto-regeneration
        this.shieldRegenTimer++;
        if (this.shieldRegenTimer > 180) { // After 3 seconds without taking damage
            if (this.shield < this.maxShield) {
                const prevShield = this.shield;
                this.shield = Math.min(this.maxShield, this.shield + 0.35);
                if (prevShield < this.maxShield && this.shield >= this.maxShield && particleEngine) {
                    particleEngine.addFloatingText('QUANTUM SHIELD 100% ONLINE', this.x + this.width / 2, this.y - 12, '#ffd700');
                }
            }
        }

        // Energy slow recharge
        if (this.energy < this.maxEnergy) {
            this.energy = Math.min(this.maxEnergy, this.energy + 0.15);
        }

        // Invulnerability timer countdown
        if (this.isInvulnerable) {
            this.invulnerableTimer--;
            if (this.invulnerableTimer <= 0) {
                this.isInvulnerable = false;
            }
        }

        // Fire rate cooldown
        if (this.fireCooldown > 0) {
            this.fireCooldown--;
        }

        // Thruster particle emissions
        this.thrusterCycle += 0.3;
        if (particleEngine && Math.random() < 0.8) {
            const centerX = this.x + this.width / 2;
            const bottomY = this.y + this.height;
            particleEngine.addThruster(
                centerX + (Math.random() - 0.5) * 8,
                bottomY,
                (Math.random() - 0.5) * 1.5,
                Math.random() * 3 + 4,
                this.skinColor
            );
        }
    }

    /**
     * Attempts to fire player lasers based on current weapon level
     * Returns an array of newly created Bullet objects
     */
    shoot(audioSynth) {
        if (this.fireCooldown > 0) return [];

        this.fireCooldown = this.baseFireRate;
        const bullets = [];
        const centerX = this.x + this.width / 2;
        const topY = this.y + 4;

        if (this.weaponLevel === 1) {
            // Level 1: Single Center Blaster
            bullets.push(new PlayerBullet(centerX, topY, 0, -14, '#00ffcc', 14));
            if (audioSynth) audioSynth.playLaser(1);
        } else if (this.weaponLevel === 2) {
            // Level 2: Dual Twin Lasers
            bullets.push(new PlayerBullet(this.x + 8, topY + 8, 0, -14, '#00ffff', 16));
            bullets.push(new PlayerBullet(this.x + this.width - 8, topY + 8, 0, -14, '#00ffff', 16));
            if (audioSynth) audioSynth.playLaser(2);
        } else if (this.weaponLevel === 3) {
            // Level 3: Plasma Spread (Center + 2 Angled)
            bullets.push(new PlayerBullet(centerX, topY, 0, -15, '#39ff14', 20));
            bullets.push(new PlayerBullet(this.x + 6, topY + 6, -2.5, -14, '#39ff14', 16));
            bullets.push(new PlayerBullet(this.x + this.width - 6, topY + 6, 2.5, -14, '#39ff14', 16));
            if (audioSynth) audioSynth.playLaser(3);
        } else {
            // Level 4: Hyper Photon Spread (5 beams)
            bullets.push(new PlayerBullet(centerX, topY, 0, -16, '#ff007f', 25));
            bullets.push(new PlayerBullet(centerX - 10, topY + 4, -2, -15, '#ff00ff', 20));
            bullets.push(new PlayerBullet(centerX + 10, topY + 4, 2, -15, '#ff00ff', 20));
            bullets.push(new PlayerBullet(this.x + 2, topY + 10, -4.5, -13, '#00e5ff', 18));
            bullets.push(new PlayerBullet(this.x + this.width - 2, topY + 10, 4.5, -13, '#00e5ff', 18));
            if (audioSynth) audioSynth.playLaser(4);
        }

        return bullets;
    }

    /**
     * Detonates a Banana Quantum Mega Bomb if available
     */
    triggerMegaBomb(audioSynth) {
        if (this.megaBombs <= 0) return false;
        this.megaBombs--;
        if (audioSynth) audioSynth.playBomb();
        return true;
    }

    /**
     * Inflicts damage upon the player:
     * - Quantum Shield absorbs projectile/collision force first
     * - When Quantum Shield breaks (0), Hull takes direct impact and loses 1 life
     * - Fires visual floating combat text & sound
     */
    takeDamage(amount, audioSynth, particleEngine) {
        if (this.isInvulnerable) return false;

        this.shieldRegenTimer = 0;
        const particles = particleEngine || window.game?.particles;
        const centerX = this.x + this.width / 2;
        const topY = this.y - 10;

        if (this.shield > 0) {
            const absorbed = Math.min(Math.round(this.shield), amount);
            this.shield -= amount;

            if (this.shield <= 0) {
                this.shield = 0;
                if (particles) {
                    particles.addFloatingText('SHIELD COLLAPSED! HULL AT RISK!', centerX, topY, '#ff3366');
                }
            } else {
                if (particles) {
                    const color = this.shield < 30 ? '#ff8c00' : '#ffd700';
                    particles.addFloatingText(`SHIELD DEFLECTED -${absorbed} [${Math.round(this.shield)}%]`, centerX, topY, color);
                }
            }
            if (audioSynth) audioSynth.playShieldHit();
        } else {
            // Shield was already 0 — direct Hull breach!
            this.lives--;
            this.shield = 40; // Emergency reserve reboot
            this.isInvulnerable = true;
            this.invulnerableTimer = 110; // ~1.8 seconds invulnerability

            if (particles) {
                particles.addFloatingText(
                    `HULL BREACH! -1 LIFE (${Math.max(0, this.lives)} REMAINING)`,
                    centerX,
                    topY,
                    '#ff0055'
                );
            }
            if (audioSynth) audioSynth.playPlayerExplosion();
        }

        return true;
    }

    upgradeWeapon() {
        if (this.weaponLevel < 4) {
            this.weaponLevel++;
            return true;
        }
        return false;
    }

    rechargeShield(amount = 50) {
        this.shield = Math.min(this.maxShield, this.shield + amount);
    }

    addBomb() {
        this.megaBombs = Math.min(5, this.megaBombs + 1);
    }

    /**
     * Renders the futuristic spacecraft with dynamic tilt and hull glowing
     */
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.tilt);

        // Invulnerability flickering effect
        if (this.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
            ctx.globalAlpha = 0.35;
        }

        const hw = this.width / 2;
        const hh = this.height / 2;

        // Active Shield Forcefield Bubble (Vibrant Golden-Cyan energetic aura)
        if (this.shield > 0) {
            const shieldRatio = this.shield / this.maxShield;
            const shieldColor = shieldRatio < 0.25 ? '#ff3366' : (shieldRatio < 0.6 ? '#ffb703' : '#ffd700');
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, hw + 12, hh + 12, 0, 0, Math.PI * 2);
            ctx.strokeStyle = shieldColor;
            ctx.lineWidth = 2.4;
            ctx.shadowColor = shieldColor;
            ctx.shadowBlur = 14 * shieldRatio + 4;
            ctx.globalAlpha = 0.4 + shieldRatio * 0.45;
            ctx.stroke();

            // Inner harmonic forcefield shimmer
            const shieldGrad = ctx.createRadialGradient(0, 0, hw * 0.4, 0, 0, hw + 12);
            shieldGrad.addColorStop(0, 'rgba(255, 215, 0, 0)');
            shieldGrad.addColorStop(0.8, `${shieldColor}22`);
            shieldGrad.addColorStop(1, `${shieldColor}55`);
            ctx.fillStyle = shieldGrad;
            ctx.fill();
            ctx.restore();
        }

        // Outer Wingtips / Cannons — Clean Ice-Cyan
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(-hw, hh - 12);
        ctx.lineTo(-hw + 6, hh - 28);
        ctx.lineTo(-hw + 10, hh - 8);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(hw, hh - 12);
        ctx.lineTo(hw - 6, hh - 28);
        ctx.lineTo(hw - 10, hh - 8);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Main Hull Body
        ctx.beginPath();
        ctx.moveTo(0, -hh); // Nose
        ctx.lineTo(hw - 8, hh - 8); // Right wing corner
        ctx.lineTo(hw - 18, hh - 2);
        ctx.lineTo(0, hh - 12); // Engine center notch
        ctx.lineTo(-hw + 18, hh - 2);
        ctx.lineTo(-hw + 8, hh - 8); // Left wing corner
        ctx.closePath();

        // Hull Gradient — Sleek Titanium Slate to Deep Obsidian
        const hullGrad = ctx.createLinearGradient(0, -hh, 0, hh);
        hullGrad.addColorStop(0,   '#f8fafc');
        hullGrad.addColorStop(0.3, '#334155');
        hullGrad.addColorStop(0.7, '#1e293b');
        hullGrad.addColorStop(1,   '#0f172a');
        ctx.fillStyle = hullGrad;
        ctx.shadowColor = this.skinColor || '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Hull Edge Outline
        ctx.strokeStyle = this.skinColor || '#38bdf8';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Clean Panel Accent Lines
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(-hw + 14, hh - 14);
        ctx.lineTo(-6, -hh + 20);
        ctx.moveTo(hw - 14, hh - 14);
        ctx.lineTo(6, -hh + 20);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Cockpit Canopy (Glass with Cyan Reflection)
        ctx.beginPath();
        ctx.ellipse(0, -hh + 20, 6, 12, 0, 0, Math.PI * 2);
        const cockpitGrad = ctx.createLinearGradient(0, -hh + 8, 0, -hh + 32);
        cockpitGrad.addColorStop(0,   '#ffffff');
        cockpitGrad.addColorStop(0.4, '#38bdf8');
        cockpitGrad.addColorStop(1,   '#0369a1');
        ctx.fillStyle = cockpitGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Dual Engine Thruster Nozzles — Clean Electric Blue Flame
        const flameHeight = 14 + Math.sin(this.thrusterCycle) * 6;
        const flameGrad = ctx.createLinearGradient(0, hh - 10, 0, hh + flameHeight);
        flameGrad.addColorStop(0,   '#ffffff');
        flameGrad.addColorStop(0.2, '#7dd3fc');
        flameGrad.addColorStop(0.6, '#0284c7');
        flameGrad.addColorStop(1,   'rgba(2, 132, 199, 0)');

        ctx.fillStyle = flameGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-10, hh - 8);
        ctx.lineTo(-5, hh + flameHeight);
        ctx.lineTo(0, hh - 8);
        ctx.lineTo(5, hh + flameHeight);
        ctx.lineTo(10, hh - 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();

        // On-Canvas Tactical Status HUD (Directly beneath ship)
        // Shows shield percentage bar (Gold/Amber) and remaining Hull lives (3 Gold Dots)
        const gaugeX = this.x + this.width / 2 - 18;
        const gaugeY = this.y + this.height + 14;
        const gaugeWidth = 36;
        const gaugeHeight = 3.5;

        ctx.save();
        // Background track
        ctx.fillStyle = 'rgba(5, 8, 20, 0.75)';
        ctx.fillRect(gaugeX - 1, gaugeY - 1, gaugeWidth + 2, gaugeHeight + 2);

        // Shield fill (Yellow/Gold / Amber / Crimson)
        const shieldRatio = Math.max(0, Math.min(1, this.shield / this.maxShield));
        if (shieldRatio > 0) {
            ctx.fillStyle = shieldRatio < 0.25 ? '#ff3366' : (shieldRatio < 0.6 ? '#ffb703' : '#ffd700');
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 4;
            ctx.fillRect(gaugeX, gaugeY, gaugeWidth * shieldRatio, gaugeHeight);
        }

        // Hull Lives Pips (3 segmented gold dots below shield bar)
        const pipsY = gaugeY + gaugeHeight + 4;
        for (let i = 0; i < 3; i++) {
            const pipX = gaugeX + 6 + i * 12;
            ctx.beginPath();
            ctx.arc(pipX, pipsY, 2.5, 0, Math.PI * 2);
            if (i < this.lives) {
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 4;
            } else {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                ctx.shadowBlur = 0;
            }
            ctx.fill();
        }
        ctx.restore();
    }
}

/**
 * Bullet projectile fired by Player
 */
class PlayerBullet {
    constructor(x, y, vx, vy, color = '#00ffcc', damage = 15) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 3.5;
        this.color = color;
        this.damage = damage;
        this.isDestroyed = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y < -20 || this.x < -20 || this.x > 850) {
            this.isDestroyed = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;
        ctx.fill();

        // Laser trail
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 1.5, this.y - this.vy * 1.5);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
    }
}

window.Player = Player;
window.PlayerBullet = PlayerBullet;
