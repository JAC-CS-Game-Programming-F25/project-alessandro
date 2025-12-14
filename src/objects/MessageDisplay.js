import { context, canvas } from "../globals.js";

/**
 * Displays temporary messages on screen (like "Need $X more!")
 */
export default class MessageDisplay {
    constructor() {
        this.messages = [];
    }

    /**
     * Show a message on screen
     * @param {string} text - The message to display
     * @param {number} duration - How long to show it (seconds)
     * @param {string} color - Message color (default: red for warnings)
     */
    showMessage(text, duration = 3, color = "#f44336") {
        // Check if this exact message is already being displayed
        const existingMessage = this.messages.find((msg) => msg.text === text);

        if (existingMessage) {
            // Reset the duration and alpha instead of adding a duplicate
            existingMessage.elapsed = 0;
            existingMessage.alpha = 1.0;
            existingMessage.duration = duration;
            return;
        }

        // Add new message
        this.messages.push({
            text: text,
            duration: duration,
            elapsed: 0,
            color: color,
            alpha: 1.0,
        });
    }

    update(dt) {
        // Update all messages
        this.messages.forEach((msg) => {
            msg.elapsed += dt;

            // Fade out in the last 0.5 seconds
            if (msg.elapsed > msg.duration - 0.5) {
                msg.alpha = (msg.duration - msg.elapsed) / 0.5;
            }
        });

        // Remove expired messages
        this.messages = this.messages.filter(
            (msg) => msg.elapsed < msg.duration
        );
    }

    render() {
        if (this.messages.length === 0) return;

        context.save();

        // Render messages stacked vertically
        let yOffset = canvas.height / 2 - 100;

        this.messages.forEach((msg) => {
            const boxWidth = 400;
            const boxHeight = 80;
            const boxX = canvas.width / 2 - boxWidth / 2;
            const boxY = yOffset;

            // Background with fade
            context.fillStyle = `rgba(0, 0, 0, ${0.85 * msg.alpha})`;
            context.fillRect(boxX, boxY, boxWidth, boxHeight);

            // Border with glow
            context.shadowBlur = 15 * msg.alpha;
            context.shadowColor = msg.color;
            context.strokeStyle = msg.color;
            context.globalAlpha = msg.alpha;
            context.lineWidth = 3;
            context.strokeRect(boxX, boxY, boxWidth, boxHeight);
            context.shadowBlur = 0;

            // Warning icon
            context.font = "32px Arial";
            context.textAlign = "center";
            context.fillStyle = msg.color;
            context.fillText("⚠️", canvas.width / 2, boxY + 35);

            // Message text
            context.font = "bold 18px Arial";
            context.fillStyle = "#ffffff";
            context.fillText(msg.text, canvas.width / 2, boxY + 62);

            context.globalAlpha = 1.0;
            yOffset += boxHeight + 20; // Stack next message below
        });

        context.restore();
    }
}
