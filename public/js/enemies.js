/**
 * ====================================================================
 * Galaxy Defender — Enemies, Bosses & Collectibles Module
 * Handles:
 *  - Diverse Enemy AI behaviors (Scouts, Asteroids, Raiders, Bombers)
 *  - Mothership Sector Boss with multi-phase mechanics & Health HUD
 *  - Power-Up Drops (Shields, Weapon Upgrades, Banana Quantum Cores)
 *  - Enemy Projectile Ballistics & Collision geometry
 * ====================================================================
 */

class BaseEnemy {
    constructor(x, y, width, height, hp, points) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hp = hp;
        this.maxHp = hp;
        this.points = points;
        this.isDestroyed = false;
        this.isBoss = false;
        this.hitFlashTimer = 0;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlashTimer = 4; // Flash white when hit
        if (this.hp <= 0) {
            this.isDestroyed = true;
            return true; // killed
        }
        return false;
    }

    isOffScreen(canvasHeight, canvasWidth) {
        return this.y > canvasHeight + 100 || this.x < -150 || this.x > canvasWidth + 150;
    }
}

/**
 * 1. Scout Drone: Agile, weaves left and right while diving
 */
class ScoutDrone extends BaseEnemy {
    constructor(x, y) {
        super(x, y, 32, 34, 20, 100);
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = Math.random() * 1.5 + 2.5;
        this.angle = 0;
        this.freq = Math.random() * 0.04 + 0.03;
        this.startX = x;
        this.amplitude = Math.random() * 60 + 40;
    }

    update(bullets) {
        this.angle += this.freq;
        this.x = this.startX + Math.sin(this.angle) * this.amplitude;
        this.y += this.vy;
        if (this.hitFlashTimer > 0) this.hitFlashTimer--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#ff1a4a';
        }

        // Sleek V-shape drone
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, -this.height / 2);
        ctx.lineTo(0, -this.height / 4);
        ctx.lineTo(this.width / 2, -this.height / 2);
        ctx.closePath();
        ctx.shadowColor = '#ff2d55';
        ctx.shadowBlur = 14;
        ctx.fill();

        ctx.strokeStyle = '#ff6680';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Eye sensor — vivid gold
        ctx.shadowColor = '#ffc400';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#ffc400';
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

/**
 * 2. Asteroid: Rotates realistically; splits on destruction
 */
class Asteroid extends BaseEnemy {
    constructor(x, y, size = 'large') {
        const radiusMap = { large: 32, medium: 20, small: 12 };
        const hpMap = { large: 45, medium: 25, small: 10 };
        const ptMap = { large: 80, medium: 50, small: 25 };

        const radius = radiusMap[size] || 24;
        super(x - radius, y - radius, radius * 2, radius * 2, hpMap[size], ptMap[size]);

        this.size = size;
        this.radius = radius;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = Math.random() * 1.2 + 1.2;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.04;

        // Generate rough polygon vertices
        this.pointsCount = 8;
        this.vertices = [];
        for (let i = 0; i < this.pointsCount; i++) {
            const angle = (i / this.pointsCount) * Math.PI * 2;
            const dist = this.radius * (0.8 + Math.random() * 0.4);
            this.vertices.push({
                x: Math.cos(angle) * dist,
                y: Math.sin(angle) * dist
            });
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rot += this.rotSpeed;
        if (this.hitFlashTimer > 0) this.hitFlashTimer--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.radius, this.y + this.radius);
        ctx.rotate(this.rot);

        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        for (let i = 1; i < this.vertices.length; i++) {
            ctx.lineTo(this.vertices[i].x, this.vertices[i].y);
        }
        ctx.closePath();

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            // Deep orange-red asteroid with glow
            const grad = ctx.createLinearGradient(-this.radius, -this.radius, this.radius, this.radius);
            grad.addColorStop(0, '#7a6040');
            grad.addColorStop(0.5, '#4e3820');
            grad.addColorStop(1, '#1e1408');
            ctx.fillStyle = grad;
        }
        ctx.fill();

        ctx.strokeStyle = '#c8a060';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#c87030';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

/**
 * 3. Crimson Raider: Fires targeting laser pulses at the player
 */
class CrimsonRaider extends BaseEnemy {
    constructor(x, y) {
        super(x, y, 42, 40, 50, 200);
        this.vx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 1.5 + 1.2);
        this.vy = Math.random() * 0.8 + 1.2;
        this.shootTimer = Math.floor(Math.random() * 60) + 40;
    }

    update(enemyBullets, playerX, playerY) {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce horizontally inside margins
        if (this.x < 30 || this.x > 800 - this.width - 30) {
            this.vx *= -1;
        }

        // Firing logic
        this.shootTimer--;
        if (this.shootTimer <= 0) {
            this.shootTimer = Math.floor(Math.random() * 70) + 60;

            // Target vector toward player
            const centerX = this.x + this.width / 2;
            const bottomY = this.y + this.height;
            const dx = playerX - centerX;
            const dy = playerY - bottomY;
            const dist = Math.hypot(dx, dy) || 1;
            const bulletSpeed = 5.5;

            enemyBullets.push(new EnemyBullet(
                centerX,
                bottomY,
                (dx / dist) * bulletSpeed,
                (dy / dist) * bulletSpeed,
                '#ff3366'
            ));
        }

        if (this.hitFlashTimer > 0) this.hitFlashTimer--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#cc0a2a';
        }

        // Heavy attack hull — vivid crimson with orange glow
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(-this.width / 2, -this.height / 4);
        ctx.lineTo(-this.width / 4, -this.height / 2);
        ctx.lineTo(this.width / 4, -this.height / 2);
        ctx.lineTo(this.width / 2, -this.height / 4);
        ctx.closePath();

        ctx.shadowColor = '#ff2200';
        ctx.shadowBlur = 16;
        ctx.fill();

        ctx.strokeStyle = '#ff6020';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulsing energy core
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

/**
 * 4. Void Bomber: Launches homing plasma orbs
 */
class VoidBomber extends BaseEnemy {
    constructor(x, y) {
        super(x, y, 54, 48, 90, 350);
        this.vy = 1.0;
        this.shootTimer = 90;
    }

    update(enemyBullets, playerX, playerY) {
        this.y += this.vy;
        this.shootTimer--;

        if (this.shootTimer <= 0) {
            this.shootTimer = 110;
            const centerX = this.x + this.width / 2;
            const bottomY = this.y + this.height;

            // Triple cluster spread
            enemyBullets.push(new EnemyBullet(centerX, bottomY, 0, 4.5, '#ffaa00', 6));
            enemyBullets.push(new EnemyBullet(centerX, bottomY, -1.8, 4.0, '#ffaa00', 5));
            enemyBullets.push(new EnemyBullet(centerX, bottomY, 1.8, 4.0, '#ffaa00', 5));
        }

        if (this.hitFlashTimer > 0) this.hitFlashTimer--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = '#4a148c';
        }

        // Heavy diamond hull
        ctx.beginPath();
        ctx.moveTo(0, this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(this.width / 3, -this.height / 2);
        ctx.lineTo(-this.width / 3, -this.height / 2);
        ctx.lineTo(-this.width / 2, 0);
        ctx.closePath();

        ctx.shadowColor = '#e040fb';
        ctx.shadowBlur = 12;
        ctx.fill();

        ctx.strokeStyle = '#ea80fc';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}

/**
 * 5. Mothership Boss: Sector Boss with multiple firing phases & health bar
 */
class MothershipBoss extends BaseEnemy {
    constructor(canvasWidth, sector = 1) {
        const width = 160;
        const height = 90;
        const hp = 800 + (sector - 1) * 450;
        super(canvasWidth / 2 - width / 2, -120, width, height, hp, 2500 * sector);

        this.canvasWidth = canvasWidth;
        this.sector = sector;
        this.isBoss = true;
        this.targetY = 70;
        this.state = 'ENTERING'; // 'ENTERING', 'BATTLE', 'DEFEATED'
        this.vx = 2.2;
        this.attackPatternTimer = 0;
        this.phase = 1;
        this.name = `DREADNOUGHT NEXUS — SECTOR ${sector}`;
    }

    update(enemyBullets, playerX, playerY, audioSynth) {
        if (this.hitFlashTimer > 0) this.hitFlashTimer--;

        if (this.state === 'ENTERING') {
            this.y += 1.5;
            if (this.y >= this.targetY) {
                this.y = this.targetY;
                this.state = 'BATTLE';
            }
            return;
        }

        // Sector boss phase shifts based on remaining HP
        const hpPct = this.hp / this.maxHp;
        if (hpPct <= 0.35) {
            this.phase = 3; // Enraged
            this.vx = Math.sign(this.vx) * 3.8;
        } else if (hpPct <= 0.70) {
            this.phase = 2;
            this.vx = Math.sign(this.vx) * 2.8;
        }

        // Sweeping lateral motion
        this.x += this.vx;
        if (this.x < 30) {
            this.x = 30;
            this.vx *= -1;
        } else if (this.x + this.width > this.canvasWidth - 30) {
            this.x = this.canvasWidth - 30 - this.width;
            this.vx *= -1;
        }

        // Attack patterns
        this.attackPatternTimer++;

        const centerX = this.x + this.width / 2;
        const bottomY = this.y + this.height - 10;

        if (this.phase === 1) {
            // Dual laser turrets
            if (this.attackPatternTimer % 45 === 0) {
                enemyBullets.push(new EnemyBullet(this.x + 25, bottomY, 0, 5, '#ff0055', 4.5));
                enemyBullets.push(new EnemyBullet(this.x + this.width - 25, bottomY, 0, 5, '#ff0055', 4.5));
                if (audioSynth) audioSynth.playBossShoot();
            }
        } else if (this.phase === 2) {
            // Radial energy blast
            if (this.attackPatternTimer % 55 === 0) {
                for (let angle = -0.6; angle <= 0.6; angle += 0.3) {
                    const speed = 4.8;
                    enemyBullets.push(new EnemyBullet(
                        centerX,
                        bottomY,
                        Math.sin(angle) * speed,
                        Math.cos(angle) * speed,
                        '#ff9900',
                        5
                    ));
                }
                if (audioSynth) audioSynth.playBossShoot();
            }
        } else if (this.phase === 3) {
            // Enraged: rapid spiral spray
            if (this.attackPatternTimer % 18 === 0) {
                const spiralAngle = Math.sin(this.attackPatternTimer * 0.15) * 0.8;
                enemyBullets.push(new EnemyBullet(
                    centerX,
                    bottomY,
                    Math.sin(spiralAngle) * 6,
                    Math.cos(spiralAngle) * 6,
                    '#ff00ff',
                    5.5
                ));
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        const hw = this.width / 2;
        const hh = this.height / 2;

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            const grad = ctx.createLinearGradient(0, -hh, 0, hh);
            grad.addColorStop(0, '#1a0033');
            grad.addColorStop(0.5, '#4a0072');
            grad.addColorStop(1, '#120024');
            ctx.fillStyle = grad;
        }

        // Heavy Dreadnought Frame
        ctx.beginPath();
        ctx.moveTo(0, hh);
        ctx.lineTo(hw, hh - 30);
        ctx.lineTo(hw - 20, -hh);
        ctx.lineTo(-hw + 20, -hh);
        ctx.lineTo(-hw, hh - 30);
        ctx.closePath();

        ctx.shadowColor = this.phase === 3 ? '#ff0055' : '#ba68c8';
        ctx.shadowBlur = 18;
        ctx.fill();

        ctx.strokeStyle = this.phase === 3 ? '#ff1744' : '#e1bee7';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pulsing reactor core
        const pulse = 10 + Math.sin(Date.now() * 0.008) * 3;
        ctx.beginPath();
        ctx.arc(0, 0, pulse, 0, Math.PI * 2);
        ctx.fillStyle = this.phase === 3 ? '#ff0000' : '#00ffff';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 16;
        ctx.fill();

        ctx.restore();
    }
}

/**
 * Enemy Laser / Plasma Projectile
 */
class EnemyBullet {
    constructor(x, y, vx, vy, color = '#ff3366', radius = 4) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.radius = radius;
        this.isDestroyed = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.y > 1000 || this.y < -50 || this.x < -50 || this.x > 1500) {
            this.isDestroyed = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * Power-Up Drops (Banana Core, Shield, Weapon Upgrade, Mega Bomb)
 */
class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'banana', 'shield', 'weapon', 'bomb'
        this.radius = 16;
        this.vy = 1.8;
        this.wobble = 0;
        this.isDestroyed = false;
    }

    update() {
        this.y += this.vy;
        this.wobble += 0.05;
        this.x += Math.sin(this.wobble) * 0.8;
        if (this.y > 1000) {
            this.isDestroyed = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Pulsing glow
        const glow = 8 + Math.sin(this.wobble * 2) * 4;
        let color = '#00ffcc';
        let symbol = '⚡';

        if (this.type === 'banana') {
            color = '#ffcc00';
            symbol = '🍌';
        } else if (this.type === 'shield') {
            color = '#00e5ff';
            symbol = '🛡️';
        } else if (this.type === 'weapon') {
            color = '#ff007f';
            symbol = 'UP';
        } else if (this.type === 'bomb') {
            color = '#ff5500';
            symbol = '💣';
        }

        // Orb background
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10, 15, 30, 0.85)';
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Icon inside orb
        ctx.fillStyle = '#ffffff';
        if (this.type === 'weapon') {
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, 0, 1);
        } else {
            ctx.font = '15px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(symbol, 0, 1);
        }

        ctx.restore();
    }
}

window.ScoutDrone = ScoutDrone;
window.Asteroid = Asteroid;
window.CrimsonRaider = CrimsonRaider;
window.VoidBomber = VoidBomber;
window.MothershipBoss = MothershipBoss;
window.EnemyBullet = EnemyBullet;
window.PowerUp = PowerUp;
