import { context } from "../globals.js";
import Tile from "../services/Tile.js";

/**
 * Animated exit portal that changes when quota is met
 */
export default class ExitPortal {
    constructor(x, y, width, height, level = null) {
        this.x = x * Tile.SIZE;
        this.y = y * Tile.SIZE;
        this.width = width * Tile.SIZE;
        this.height = height * Tile.SIZE;
        this.level = level; // Store level reference

        this.isUnlocked = false;
        this.pulseTime = 0;
        this.particles = [];
    }

    unlock() {
        this.isUnlocked = true;

        // Show message that exit is unlocked
        if (this.level && this.level.messageDisplay) {
            this.level.messageDisplay.showMessage(
                "Exit is now open!",
                4,
                "#4CAF50" // Green color for success
            );
        }

        // TODO: Play exit unlock sound here
        // sounds.play('exit-unlock');

        // Create unlock particle burst
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            this.particles.push({
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                vx: Math.cos(angle) * 100,
                vy: Math.sin(angle) * 100,
                life: 1.0,
                size: 3,
            });
        }
    }

    update(dt, quotaMet) {
        // Check if should unlock
        if (quotaMet && !this.isUnlocked) {
            this.unlock();
        }

        this.pulseTime += dt * 3;

        // Update particles
        this.particles.forEach((p) => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        });
        this.particles = this.particles.filter((p) => p.life > 0);
    }

    render() {
        context.save();

        // Portal base
        const color = this.isUnlocked ? "#4CAF50" : "#f44336";
        const pulseScale = 1 + Math.sin(this.pulseTime) * 0.1;

        // Glow effect
        context.shadowBlur = 20 * pulseScale;
        context.shadowColor = color;

        // Portal rectangle
        context.fillStyle = color;
        context.globalAlpha = 0.3;
        context.fillRect(this.x, this.y, this.width, this.height);

        // Border
        context.globalAlpha = 1.0;
        context.strokeStyle = color;
        context.lineWidth = 3 * pulseScale;
        context.strokeRect(this.x, this.y, this.width, this.height);

        // Animated particles inside portal
        if (this.isUnlocked) {
            for (let i = 0; i < 5; i++) {
                const x = this.x + Math.random() * this.width;
                const y = this.y + Math.random() * this.height;
                const size = 2 + Math.random() * 3;

                context.fillStyle = "#ffffff";
                context.globalAlpha = 0.5 + Math.random() * 0.5;
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }
        }

        // Unlock particles
        context.globalAlpha = 1.0;
        this.particles.forEach((p) => {
            context.fillStyle = "#4CAF50";
            context.globalAlpha = p.life;
            context.beginPath();
            context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            context.fill();
        });

        // Status text - VERTICAL stacked letters
        context.shadowBlur = 0;
        context.font = "bold 14px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.globalAlpha = 1.0;

        const text = this.isUnlocked ? "EXIT" : "LOCKED";
        const centerX = this.x + this.width / 2;
        const totalHeight = text.length * 16;
        const startY = this.y + this.height / 2 - totalHeight / 2 + 8;

        // Draw each letter stacked vertically
        for (let i = 0; i < text.length; i++) {
            const letter = text[i];
            const letterY = startY + i * 16;

            // Letter
            context.fillStyle = "#ffffff";
            context.fillText(letter, centerX, letterY);
        }

        context.restore();
    }
}
