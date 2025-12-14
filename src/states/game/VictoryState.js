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
    }

    update(dt) {
        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.transitionTo(GameStateName.TitleScreen);
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
        bgGrad.addColorStop(0.5, "#1a1a00");
        bgGrad.addColorStop(1, "#0a0a0a");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

        context.fillStyle = "rgba(255, 215, 0, 0.2)";
        context.fillRect(0, 70, width, 90);

        context.shadowBlur = 30;
        context.shadowColor = "#FFD700";
        context.fillStyle = "#FFD700";
        context.font = "bold 52px Arial";
        context.textAlign = "center";
        context.fillText("HEIST COMPLETE!", width / 2, 135);
        context.shadowBlur = 0;

        context.font = "80px Arial";
        context.fillText("🏆", width / 2, 230);

        context.fillStyle = "#4CAF50";
        context.font = "bold 32px Arial";
        context.fillText("MASTER THIEF", width / 2, 280);

        const panelWidth = 500;
        const panelHeight = 140;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = 300;

        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(panelX, panelY, panelWidth, panelHeight);
        context.strokeStyle = "#FFD700";
        context.lineWidth = 3;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);

        const minutes = Math.floor(this.totalTime / 60);
        const seconds = Math.floor(this.totalTime % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        context.fillStyle = "#FFD700";
        context.font = "bold 26px Arial";
        context.fillText(
            `💰 Total Stolen: $${this.totalMoney}`,
            width / 2,
            panelY + 55
        );
        context.fillText(
            `⏱️ Total Time: ${timeString}`,
            width / 2,
            panelY + 100
        );

        context.fillStyle = "#4CAF50";
        context.font = "bold 22px Arial";
        context.fillText(
            "Press ENTER to return to menu",
            width / 2,
            height - 80
        );

        context.restore();
    }
}
