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

export default class GameOverState extends State {
    constructor() {
        super();
        this.reason = "caught";
        this.moneyCollected = 0;
        this.quota = 10000;
        this.timeLeft = 0;
    }

    enter(params = {}) {
        setCanvasSize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);
        this.reason = params.reason || "caught";
        this.moneyCollected = params.moneyCollected || 0;
        this.quota = params.quota || 10000;
        this.timeLeft = params.timeLeft || 0;
        SaveManager.deleteSave();
    }

    update(dt) {
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.transitionTo(GameStateName.Play, { loadFromSave: false });
        }
        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
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

        // Background gradient
        const bgGrad = context.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#0a0a0a");
        bgGrad.addColorStop(0.5, "#2a0a0a");
        bgGrad.addColorStop(1, "#0a0a0a");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

        // Red warning stripes
        context.fillStyle = "rgba(244, 67, 54, 0.15)";
        for (let i = 0; i < width; i += 80) {
            context.save();
            context.translate(i, 0);
            context.rotate(-0.3);
            context.fillRect(0, -100, 40, height + 200);
            context.restore();
        }

        // Red banner
        context.fillStyle = "rgba(244, 67, 54, 0.4)";
        context.fillRect(0, 80, width, 120);

        // Title with intense glow
        context.shadowBlur = 40;
        context.shadowColor = "#f44336";
        context.fillStyle = "#f44336";
        context.font = "bold 90px Orbitron";
        context.textAlign = "center";
        const title = this.reason === "timeout" ? "TIME'S UP!" : "CAUGHT!";
        context.fillText(title, width / 2, 170);
        context.shadowBlur = 0;

        // Message
        context.fillStyle = "#fff";
        context.font = "28px Orbitron";
        const message =
            this.reason === "timeout"
                ? "You ran out of time!"
                : "The guards spotted you!";
        context.fillText(message, width / 2, 250);

        // Progress Lost panel
        const panelWidth = 450;
        const panelHeight = 150;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = 280;

        // Panel background with gradient
        const panelGrad = context.createLinearGradient(
            panelX,
            panelY,
            panelX,
            panelY + panelHeight
        );
        panelGrad.addColorStop(0, "rgba(30, 10, 10, 0.9)");
        panelGrad.addColorStop(1, "rgba(20, 5, 5, 0.9)");
        context.fillStyle = panelGrad;
        context.fillRect(panelX, panelY, panelWidth, panelHeight);

        context.strokeStyle = "#f44336";
        context.lineWidth = 3;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // Panel title
        context.fillStyle = "#f44336";
        context.font = "bold 24px Orbitron";
        context.fillText("PROGRESS LOST", width / 2, panelY + 35);

        // Stats with icons
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        const timeString = `${
            this.reason === "timeout"
                ? "0:00"
                : `${minutes}:${seconds.toString().padStart(2, "0")}`
        }`;

        context.fillStyle = "#fff";
        context.font = "bold 22px RobotoMono";
        context.fillText(
            `💰 Money: $${this.moneyCollected} / $${this.quota}`,
            width / 2,
            panelY + 80
        );
        context.fillText(
            `⏱️  Time Left: ${timeString}`,
            width / 2,
            panelY + 115
        );

        // Action buttons
        const btnWidth = 200;
        const btnHeight = 55;
        const btnSpacing = 20;
        const btn1X = width / 2 - btnWidth - btnSpacing / 2;
        const btn2X = width / 2 + btnSpacing / 2;
        const btnY = height - 120;

        // Retry button (green)
        this.renderActionButton(
            "ENTER",
            "Retry",
            btn1X,
            btnY,
            btnWidth,
            btnHeight,
            "#4CAF50"
        );

        // Main Menu button (gray)
        this.renderActionButton(
            "ESC",
            "Main Menu",
            btn2X,
            btnY,
            btnWidth,
            btnHeight,
            "#666"
        );

        context.restore();
    }

    renderActionButton(key, label, x, y, w, h, color) {
        // Button background
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
