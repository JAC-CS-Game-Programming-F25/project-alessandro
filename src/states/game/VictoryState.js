import State from "../../../lib/State.js";
import GameStateName from "../../enums/GameStateName.js";
import {
    context,
    input,
    setCanvasSize,
    MENU_CANVAS_WIDTH,
    MENU_CANVAS_HEIGHT,
    stateMachine,
} from "../../globals.js";
import Input from "../../../lib/Input.js";
import SaveManager from "../../services/SaveManager.js";

export default class VictoryState extends State {
    constructor() {
        super();
        this.totalMoney = 0;
        this.totalTime = 0;
    }

    enter(params = {}) {
        setCanvasSize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);
        this.totalMoney = params.totalMoney || 0;
        this.totalTime = params.totalTime || 0;

        // CRITICAL: Delete save when entering victory screen
        SaveManager.deleteSave();
    }

    update(dt) {
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.transitionTo(GameStateName.TitleScreen);
        }
    }

    transitionTo(stateName, parameters = {}) {
        stateMachine.change(GameStateName.Transition, {
            fromState: this,
            toState: stateMachine.states[stateName],
            toStateEnterParameters: parameters,
        });
    }

    render() {
        const width = MENU_CANVAS_WIDTH;
        const height = MENU_CANVAS_HEIGHT;
        context.save();

        // Background gradient (yellow tones like game over's red tones)
        const bgGrad = context.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#0a0a0a");
        bgGrad.addColorStop(0.5, "#2a2a0a"); // Yellow tone instead of red
        bgGrad.addColorStop(1, "#0a0a0a");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

        // Yellow diagonal stripes (matching game over's red stripes)
        context.fillStyle = "rgba(255, 215, 0, 0.15)";
        for (let i = 0; i < width; i += 80) {
            context.save();
            context.translate(i, 0);
            context.rotate(-0.3);
            context.fillRect(0, -100, 40, height + 200);
            context.restore();
        }

        // Yellow banner (matching game over's red banner)
        context.fillStyle = "rgba(255, 215, 0, 0.4)";
        context.fillRect(0, 80, width, 120);

        // Title with intense glow (matching game over)
        context.shadowBlur = 40;
        context.shadowColor = "#FFD700";
        context.fillStyle = "#FFD700";
        context.font = "bold 70px Orbitron"; // Smaller to fit
        context.textAlign = "center";
        context.fillText("HEIST COMPLETE!", width / 2, 165);
        context.shadowBlur = 0;

        // Message (matching game over's message)
        context.fillStyle = "#fff";
        context.font = "28px Orbitron";
        context.fillText("You escaped with the loot!", width / 2, 250);

        // Stats panel (matching game over's "PROGRESS LOST" panel exactly)
        const panelWidth = 450;
        const panelHeight = 150;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = 280;

        // Panel background with gradient (yellow tones instead of red)
        const panelGrad = context.createLinearGradient(
            panelX,
            panelY,
            panelX,
            panelY + panelHeight
        );
        panelGrad.addColorStop(0, "rgba(30, 30, 10, 0.9)");
        panelGrad.addColorStop(1, "rgba(20, 20, 5, 0.9)");
        context.fillStyle = panelGrad;
        context.fillRect(panelX, panelY, panelWidth, panelHeight);

        context.strokeStyle = "#FFD700";
        context.lineWidth = 3;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // Panel title (matching game over's "PROGRESS LOST")
        context.fillStyle = "#FFD700";
        context.font = "bold 24px Orbitron";
        context.fillText("FINAL SCORE", width / 2, panelY + 35);

        // Stats with emojis (matching game over exactly)
        const minutes = Math.floor(this.totalTime / 60);
        const seconds = Math.floor(this.totalTime % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        context.fillStyle = "#fff";
        context.font = "bold 22px RobotoMono";
        context.fillText(
            `💰 Money Stolen: $${this.totalMoney}`,
            width / 2,
            panelY + 80
        );
        context.fillText(
            `⏱️  Total Time: ${timeString}`,
            width / 2,
            panelY + 115
        );

        // Action button (matching game over's button style)
        const btnWidth = 200;
        const btnHeight = 55;
        const btnX = width / 2 - btnWidth / 2;
        const btnY = height - 120;

        // Return to Menu button (using same renderActionButton as game over)
        this.renderActionButton(
            "ENTER",
            "Main Menu",
            btnX,
            btnY,
            btnWidth,
            btnHeight,
            "#FFD700"
        );

        context.restore();
    }

    renderActionButton(key, label, x, y, w, h, color) {
        // Button background (EXACT same as game over)
        const btnGrad = context.createLinearGradient(x, y, x, y + h);
        btnGrad.addColorStop(0, "rgba(20, 20, 20, 0.9)");
        btnGrad.addColorStop(1, "rgba(10, 10, 10, 0.9)");
        context.fillStyle = btnGrad;
        context.fillRect(x, y, w, h);

        // Button border
        context.strokeStyle = color;
        context.lineWidth = 3;
        context.strokeRect(x, y, w, h);

        // Key box
        const keyBoxSize = 38;
        const keyBoxX = x + 15;
        const keyBoxY = y + (h - keyBoxSize) / 2;

        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(keyBoxX, keyBoxY, keyBoxSize, keyBoxSize);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.strokeRect(keyBoxX, keyBoxY, keyBoxSize, keyBoxSize);

        // Key text
        context.fillStyle = color;
        context.font = "bold 14px RobotoMono";
        context.textAlign = "center";
        context.fillText(
            key,
            keyBoxX + keyBoxSize / 2,
            keyBoxY + keyBoxSize / 2 + 5
        );

        // Label
        context.fillStyle = "#fff";
        context.font = "bold 22px Orbitron";
        context.textAlign = "left";
        context.fillText(label, keyBoxX + keyBoxSize + 15, y + h / 2 + 7);
    }
}
