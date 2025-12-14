import { context, canvas } from "../globals.js";

export default class HUD {
    constructor(level) {
        this.level = level;
    }

    render() {
        context.save();

        // Render floating panels
        this.renderMoneyPanel();
        this.renderTimerPanel();

        context.restore();
    }

    renderMoneyPanel() {
        const panelX = 15;
        const panelY = 15;
        const panelWidth = 160;
        const panelHeight = 60;

        // Panel background with transparency
        context.fillStyle = "rgba(10, 10, 10, 0.85)";
        context.fillRect(panelX, panelY, panelWidth, panelHeight);

        // Border with glow
        context.shadowBlur = 8;
        context.shadowColor = "#4CAF50";
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 2;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);
        context.shadowBlur = 0;

        // Money amount
        context.fillStyle = "#4CAF50";
        context.font = "bold 18px Arial";
        context.textAlign = "center";
        context.fillText(
            `$${Math.floor(this.level.displayedMoney)} / $${this.level.quota}`,
            panelX + panelWidth / 2,
            panelY + 25
        );

        // Progress bar
        const barX = panelX + 10;
        const barY = panelY + 38;
        const barWidth = panelWidth - 20;
        const barHeight = 12;

        // Background
        context.fillStyle = "rgba(255, 255, 255, 0.1)";
        context.fillRect(barX, barY, barWidth, barHeight);

        // Fill
        const progress = Math.min(
            this.level.displayedMoney / this.level.quota,
            1
        );

        const fillGrad = context.createLinearGradient(
            barX,
            barY,
            barX + barWidth,
            barY
        );
        fillGrad.addColorStop(0, "#4CAF50");
        fillGrad.addColorStop(1, "#66BB6A");
        context.fillStyle = fillGrad;
        context.fillRect(barX, barY, barWidth * progress, barHeight);

        // Border
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
    }

    renderTimerPanel() {
        const panelWidth = 100;
        const panelHeight = 50;
        const panelX = canvas.width - panelWidth - 15;
        const panelY = 15;

        // Panel background
        context.fillStyle = "rgba(10, 10, 10, 0.85)";
        context.fillRect(panelX, panelY, panelWidth, panelHeight);

        // Get time and determine if warning
        const timeRemaining = Math.max(0, this.level.timeRemaining || 600);
        const isWarning = timeRemaining < 60;

        // Border (red if warning, blue otherwise)
        const borderColor = isWarning ? "#f44336" : "#2196F3";
        context.shadowBlur = 8;
        context.shadowColor = borderColor;
        context.strokeStyle = borderColor;
        context.lineWidth = 2;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);
        context.shadowBlur = 0;

        // Timer value
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        context.fillStyle = isWarning ? "#f44336" : "#fff";
        context.font = "bold 24px Arial";
        context.textAlign = "center";
        context.fillText(timeString, panelX + panelWidth / 2, panelY + 34);
    }
}
