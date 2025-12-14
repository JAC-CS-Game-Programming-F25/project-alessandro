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
            this.transitionTo(GameStateName.Play);
        }

        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
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
        bgGrad.addColorStop(0.5, "#1a0a0a");
        bgGrad.addColorStop(1, "#0a0a0a");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

        context.fillStyle = "rgba(244, 67, 54, 0.3)";
        context.fillRect(0, 100, width, 90);

        context.shadowBlur = 25;
        context.shadowColor = "#f44336";
        context.fillStyle = "#f44336";
        context.font = "bold 80px Arial";
        context.textAlign = "center";
        const title = this.reason === "timeout" ? "TIME'S UP!" : "CAUGHT!";
        context.fillText(title, width / 2, 175);
        context.shadowBlur = 0;

        context.fillStyle = "#fff";
        context.font = "italic 28px Arial";
        const message =
            this.reason === "timeout"
                ? "You ran out of time!"
                : "The guards spotted you!";
        context.fillText(message, width / 2, 275);

        const panelWidth = 400;
        const panelHeight = 130;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = 320;

        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(panelX, panelY, panelWidth, panelHeight);
        context.strokeStyle = "#f44336";
        context.lineWidth = 3;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);

        context.fillStyle = "#fff";
        context.font = "24px Arial";

        const timeLeft = Math.max(0, this.timeLeft);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        context.fillText(
            `💰 Money: ${this.moneyCollected} / ${this.quota}`,
            width / 2,
            panelY + 50
        );
        context.fillText(
            `⏱️ Time Left: ${timeString}`,
            width / 2,
            panelY + 100
        );

        const btnWidth = 300;
        const btnHeight = 50;
        const btnX = width / 2 - btnWidth / 2;
        const btnY = height - 140;

        context.fillStyle = "rgba(76, 175, 80, 0.3)";
        context.fillRect(btnX, btnY, btnWidth, btnHeight);
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 3;
        context.strokeRect(btnX, btnY, btnWidth, btnHeight);

        context.fillStyle = "#4CAF50";
        context.font = "bold 24px Arial";
        context.fillText("Press ENTER to retry", width / 2, btnY + 33);

        context.fillStyle = "#666";
        context.font = "16px Arial";
        context.fillText("Press ESC for main menu", width / 2, height - 50);

        context.restore();
    }
}
