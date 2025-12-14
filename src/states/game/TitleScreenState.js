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
    }

    enter() {
        setCanvasSize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);

        // Check for save data
        const hasSaveData = this.checkForSaveData();

        // Rebuild menu options based on save data
        if (hasSaveData) {
            this.menuOptions = [
                { text: "Continue Game", color: "#4CAF50", enabled: true },
                ...this.baseMenuOptions,
            ];
            this.selectedOption = 0;
        } else {
            this.menuOptions = [...this.baseMenuOptions];
            this.selectedOption = 0;
        }
    }

    checkForSaveData() {
        // TODO: Check localStorage for save data
        return false;
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
    }

    selectOption() {
        const selected = this.menuOptions[this.selectedOption].text;

        switch (selected) {
            case "Continue Game":
                // TODO: Load save data
                this.transitionTo(GameStateName.Play);
                break;
            case "New Game":
                this.transitionTo(GameStateName.Play);
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
        context.fillText("STEALTH HEIST", width / 2, 140);
        context.shadowBlur = 0;

        let yPos = 240;
        const menuWidth = 300;
        const menuHeight = 60;
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
                    ? "bold 28px Arial"
                    : "bold 24px Arial";
            context.fillText(option.text, width / 2, yPos + 40);

            yPos += 80;
        });

        context.fillStyle = "#555";
        context.font = "18px Arial";
        context.fillText(
            "Use ↑↓ or WS to navigate, ENTER to select",
            width / 2,
            height - 50
        );

        context.restore();
    }
}
