import { context } from "../globals.js";

/**
 * Simple particle system for visual effects
 * Located in services/ as it's a game-wide system
 */
export default class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    /**
     * Create a burst of particles
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} color - Particle color
     * @param {number} count - Number of particles
     */
    burst(x, y, color = "#FFD700", count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 50 + Math.random() * 100;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 1.0,
                size: 3 + Math.random() * 3,
                color: color,
                gravity: 200,
            });
        }
    }

    /**
     * Create a sparkle effect around an item
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width of area
     * @param {number} height - Height of area
     */
    sparkle(x, y, width, height) {
        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
            const px = x + Math.random() * width;
            const py = y + Math.random() * height;

            this.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 30,
                vy: (Math.random() - 0.5) * 30 - 20, // Slight upward bias
                life: 0.8 + Math.random() * 0.4,
                maxLife: 1.0,
                size: 2 + Math.random() * 2,
                color: "#FFD700",
                gravity: 50,
            });
        }
    }

    update(dt) {
        this.particles.forEach((particle) => {
            // Apply velocity
            particle.x += particle.vx * dt;
            particle.y += particle.vy * dt;

            // Apply gravity
            particle.vy += particle.gravity * dt;

            // Decay life
            particle.life -= dt;
        });

        // Remove dead particles
        this.particles = this.particles.filter((p) => p.life > 0);
    }

    render() {
        context.save();

        this.particles.forEach((particle) => {
            const alpha = particle.life / particle.maxLife;

            context.globalAlpha = alpha;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });

        context.restore();
    }

    clear() {
        this.particles = [];
    }
}
