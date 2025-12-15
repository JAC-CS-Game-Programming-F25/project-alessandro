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

export default class TitleScreenState extends State {
    constructor() {
        super();
        this.menuOptions = [];
        this.selectedOption = 0;
        this.saveInfo = null;
    }

    enter() {
        setCanvasSize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);

        const hasSave = SaveManager.hasSaveData();
        this.saveInfo = null;

        if (hasSave) {
            const saveData = SaveManager.load();
            this.saveInfo = {
                money: saveData.moneyCollected || 0,
                time: saveData.timePlayed || 0,
            };

            this.menuOptions = [
                { text: "Continue Game", color: "#4CAF50" },
                { text: "New Game", color: "#2196F3" },
                { text: "Instructions", color: "#FF9800" },
                { text: "Exit Game", color: "#f44336" },
            ];
        } else {
            this.menuOptions = [
                { text: "New Game", color: "#4CAF50" },
                { text: "Instructions", color: "#FF9800" },
                { text: "Exit Game", color: "#f44336" },
            ];
        }

        this.selectedOption = 0;
    }

    update(dt) {
        if (
            input.isKeyPressed(Input.KEYS.ARROW_DOWN) ||
            input.isKeyPressed(Input.KEYS.S)
        ) {
            this.selectedOption =
                (this.selectedOption + 1) % this.menuOptions.length;
        }

        if (
            input.isKeyPressed(Input.KEYS.ARROW_UP) ||
            input.isKeyPressed(Input.KEYS.W)
        ) {
            this.selectedOption =
                (this.selectedOption - 1 + this.menuOptions.length) %
                this.menuOptions.length;
        }

        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.selectOption();
        }

        // Check for DELETE key press to erase save
        if (this.saveInfo && this.selectedOption === 0) {
            // Use the actual key string "Delete" instead of the constant
            if (input.isKeyPressed("Delete")) {
                SaveManager.deleteSave();
                this.enter();
            }
        }
    }

    selectOption() {
        const selected = this.menuOptions[this.selectedOption].text;
        switch (selected) {
            case "Continue Game":
                this.transitionTo(GameStateName.Play, { loadFromSave: true });
                break;
            case "New Game":
                SaveManager.deleteSave();
                this.transitionTo(GameStateName.Play, { loadFromSave: false });
                break;
            case "Instructions":
                this.transitionTo(GameStateName.Instructions);
                break;
            case "Exit Game":
                window.close();
                break;
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
        bgGrad.addColorStop(1, "#1a1a2e");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

        // Corner brackets
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(50, 80);
        context.lineTo(50, 50);
        context.lineTo(80, 50);
        context.stroke();
        context.beginPath();
        context.moveTo(width - 50, 80);
        context.lineTo(width - 50, 50);
        context.lineTo(width - 80, 50);
        context.stroke();

        // Title
        context.shadowBlur = 20;
        context.shadowColor = "#4CAF50";
        context.fillStyle = "#4CAF50";
        context.font = "bold 72px Orbitron";
        context.textAlign = "center";
        context.fillText("STEALTH HEIST", width / 2, 120);
        context.shadowBlur = 0;

        // Menu options
        const hasSave = this.saveInfo !== null;
        let yPos = hasSave ? 180 : 220;
        const menuWidth = 300;
        const menuHeight = 50;
        const menuX = (width - menuWidth) / 2;

        this.menuOptions.forEach((option, index) => {
            const btnGrad = context.createLinearGradient(
                menuX,
                yPos,
                menuX,
                yPos + menuHeight
            );
            btnGrad.addColorStop(0, "rgba(0, 0, 0, 0.6)");
            btnGrad.addColorStop(1, "rgba(0, 0, 0, 0.8)");
            context.fillStyle = btnGrad;
            context.fillRect(menuX, yPos, menuWidth, menuHeight);

            context.strokeStyle =
                index === this.selectedOption ? option.color : "#333";
            context.lineWidth = index === this.selectedOption ? 3 : 2;
            context.strokeRect(menuX, yPos, menuWidth, menuHeight);

            context.fillStyle =
                index === this.selectedOption ? option.color : "#999";
            context.font = "bold 24px Orbitron";
            context.textAlign = "center";
            context.fillText(option.text, width / 2, yPos + 32);

            yPos += 70;
        });

        // Save data panel
        if (this.saveInfo) {
            const panelWidth = 220;
            const panelHeight = 130;
            const panelX = width - panelWidth - 10;
            const panelY = (height - panelHeight) / 2;

            // Panel background
            context.fillStyle = "rgba(30, 30, 30, 0.9)";
            context.fillRect(panelX, panelY, panelWidth, panelHeight);
            context.strokeStyle = "#4CAF50";
            context.lineWidth = 2;
            context.strokeRect(panelX, panelY, panelWidth, panelHeight);

            // Title
            context.fillStyle = "#4CAF50";
            context.font = "bold 16px Orbitron";
            context.textAlign = "center";
            context.fillText("SAVE DATA", panelX + panelWidth / 2, panelY + 28);

            // Money info
            context.fillStyle = "#fff";
            context.font = "14px RobotoMono";
            context.textAlign = "left";
            context.fillText(
                "💰 Money: $" + this.saveInfo.money,
                panelX + 47,
                panelY + 58
            );

            // Time info
            const timeValue = this.saveInfo.time || 0;
            const minutes = Math.floor(timeValue / 60);
            const seconds = Math.floor(timeValue % 60);
            const timeString = `${minutes}:${seconds
                .toString()
                .padStart(2, "0")}`;
            context.fillText(
                "⏱️ Time: " + timeString,
                panelX + 47,
                panelY + 82
            );

            // Delete hint
            context.fillStyle = "#f44336";
            context.font = "10px RobotoMono";
            context.textAlign = "center";
            context.fillText(
                "Press DELETE",
                panelX + panelWidth / 2,
                panelY + 106
            );
            context.fillText(
                "to erase save",
                panelX + panelWidth / 2,
                panelY + 118
            );
        }

        // Navigation hints at bottom
        const hintY = height - 25;

        if (this.saveInfo && this.selectedOption === 0) {
            // Three hints when save data exists and Continue is selected
            context.fillStyle = "#666";
            context.font = "11px RobotoMono";
            context.textAlign = "center";

            // Left hint
            context.fillText("↑↓ or WS", width / 2 - 180, hintY - 15);
            context.fillText("Navigate", width / 2 - 180, hintY);

            // Center hint
            context.fillText("ENTER", width / 2, hintY - 15);
            context.fillText("Select", width / 2, hintY);

            // Right hint
            context.fillText("DELETE", width / 2 + 180, hintY - 15);
            context.fillText("Erase Save", width / 2 + 180, hintY);
        } else {
            // Two hints centered when no save data
            context.fillStyle = "#666";
            context.font = "11px RobotoMono";
            context.textAlign = "center";

            // Left hint
            context.fillText("↑↓ or WS", width / 2 - 90, hintY - 15);
            context.fillText("Navigate", width / 2 - 90, hintY);

            // Right hint
            context.fillText("ENTER", width / 2 + 90, hintY - 15);
            context.fillText("Select", width / 2 + 90, hintY);
        }

        context.restore();
    }
}
