import State from "../../../lib/State.js";
import GameStateName from "../../enums/GameStateName.js";
import SaveManager from "../../services/SaveManager.js";
import {
    context,
    input,
    setCanvasSize,
    MENU_CANVAS_WIDTH,
    MENU_CANVAS_HEIGHT,
    stateMachine,
} from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class TitleScreenState extends State {
    constructor() {
        super();
        this.baseMenuOptions = [
            { text: "New Game", color: "#2196F3", enabled: true },
            { text: "Instructions", color: "#FF9800", enabled: true },
            { text: "Quit", color: "#f44336", enabled: true },
        ];
        this.menuOptions = [...this.baseMenuOptions];
        this.selectedOption = 0;
        this.saveInfo = null;
    }

    enter() {
        setCanvasSize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);

        // Check for save data
        const hasSaveData = SaveManager.hasSaveData();
        this.saveInfo = hasSaveData ? SaveManager.getSaveInfo() : null;

        // Rebuild menu options based on save data
        if (hasSaveData) {
            this.menuOptions = [
                { text: "Continue Game", color: "#4CAF50", enabled: true },
                ...this.baseMenuOptions,
            ];
            this.selectedOption = 0; // Select "Continue Game"
        } else {
            this.menuOptions = [...this.baseMenuOptions];
            this.selectedOption = 0; // Select "New Game"
        }
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

        // Press DELETE to delete save when Continue is highlighted
        if (
            this.saveInfo &&
            this.selectedOption === 0 &&
            input.isKeyPressed(Input.KEYS.DELETE)
        ) {
            SaveManager.deleteSave();
            this.enter(); // Refresh menu
        }
    }

    selectOption() {
        const selected = this.menuOptions[this.selectedOption].text;

        switch (selected) {
            case "Continue Game":
                // Load game from save
                this.transitionTo(GameStateName.Play, { loadFromSave: true });
                break;
            case "New Game":
                // Start fresh (delete any existing save)
                SaveManager.deleteSave();
                this.transitionTo(GameStateName.Play, { loadFromSave: false });
                break;
            case "Instructions":
                this.transitionTo(GameStateName.Instructions);
                break;
            case "Quit":
                window.close();
                break;
        }
    }

    /**
     * Helper method to transition to another state
     */
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

        const bgGrad = context.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#0a0a0a");
        bgGrad.addColorStop(1, "#1a1a2e");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

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

        context.shadowBlur = 20;
        context.shadowColor = "#4CAF50";
        context.fillStyle = "#4CAF50";
        context.font = "bold 72px Arial";
        context.textAlign = "center";
        context.fillText("STEALTH HEIST", width / 2, 120);
        context.shadowBlur = 0;

        // Adjust menu starting position based on whether save info will be shown
        const hasSave = this.saveInfo !== null;
        let yPos = hasSave ? 180 : 220;
        const menuWidth = 300;
        const menuHeight = 50; // Slightly smaller
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
            context.lineWidth = index === this.selectedOption ? 4 : 2;
            context.strokeRect(menuX, yPos, menuWidth, menuHeight);

            const textColor = option.enabled ? option.color : "#555";
            context.fillStyle =
                index === this.selectedOption ? "#fff" : textColor;
            context.font =
                index === this.selectedOption
                    ? "bold 26px Arial"
                    : "bold 22px Arial";
            context.fillText(option.text, width / 2, yPos + 33);

            yPos += 65; // Tighter spacing
        });

        // Show save info if Continue is available (always show, not just when highlighted)
        if (this.saveInfo) {
            const infoY = hasSave
                ? 180 + 65 * this.menuOptions.length + 10
                : yPos;

            context.fillStyle = "rgba(76, 175, 80, 0.15)";
            context.fillRect(width / 2 - 180, infoY, 360, 80);
            context.strokeStyle = "#4CAF50";
            context.lineWidth = 2;
            context.strokeRect(width / 2 - 180, infoY, 360, 80);

            context.fillStyle = "#4CAF50";
            context.font = "bold 14px Arial";
            context.textAlign = "center";
            context.fillText("SAVE DATA", width / 2, infoY + 18);

            context.fillStyle = "#fff";
            context.font = "13px Arial";
            context.fillText(
                `💰 Money: ${this.saveInfo.money}`,
                width / 2,
                infoY + 40
            );
            context.fillText(
                `⏱️ Time: ${this.saveInfo.timeRemaining}`,
                width / 2,
                infoY + 58
            );

            // Only show delete hint when Continue is selected
            if (this.selectedOption === 0) {
                context.fillStyle = "#f44336";
                context.font = "11px Arial";
                context.fillText(
                    `Press DELETE to erase save`,
                    width / 2,
                    infoY + 74
                );
            }
        }

        context.fillStyle = "#555";
        context.font = "18px Arial";
        context.textAlign = "center";
        context.fillText(
            "Use ↑↓ or WS to navigate, ENTER to select",
            width / 2,
            height - 50
        );

        context.restore();
    }
}
