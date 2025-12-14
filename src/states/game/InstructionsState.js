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

export default class InstructionsState extends State {
    constructor() {
        super();
    }

    enter() {
        setCanvasSize(MENU_CANVAS_WIDTH, MENU_CANVAS_HEIGHT);
    }

    update(dt) {
        if (
            input.isKeyPressed(Input.KEYS.ESCAPE) ||
            input.isKeyPressed(Input.KEYS.ENTER)
        ) {
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
        bgGrad.addColorStop(1, "#1a1a2e");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

        const titleBoxX = width / 2 - 250;
        const titleBoxY = 40;
        context.fillStyle = "rgba(76, 175, 80, 0.2)";
        context.fillRect(titleBoxX, titleBoxY, 500, 70);
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 3;
        context.strokeRect(titleBoxX, titleBoxY, 500, 70);

        context.fillStyle = "#4CAF50";
        context.font = "bold 42px Arial";
        context.textAlign = "center";
        context.fillText("HOW TO PLAY", width / 2, 90);

        context.fillStyle = "rgba(33, 150, 243, 0.3)";
        context.fillRect(80, 140, width - 160, 35);
        context.fillStyle = "#2196F3";
        context.font = "bold 22px Arial";
        context.textAlign = "left";
        context.fillText("CONTROLS", 95, 165);

        context.fillStyle = "#fff";
        context.font = "20px Arial";
        const controls = [
            "WASD - Move your character",
            "SHIFT - Crouch (slower, harder to detect)",
            "E - Pick up valuable items",
            "ESC - Pause game",
        ];
        let yPos = 200;
        controls.forEach((control) => {
            context.fillText(control, 110, yPos);
            yPos += 32;
        });

        context.fillStyle = "rgba(33, 150, 243, 0.3)";
        context.fillRect(80, 330, width - 160, 35);
        context.fillStyle = "#2196F3";
        context.font = "bold 22px Arial";
        context.fillText("OBJECTIVE", 95, 355);

        context.fillStyle = "#fff";
        context.font = "20px Arial";
        const objectives = [
            "• Collect items to reach money quota ($10,000)",
            "• Avoid guard vision cones",
            "• Reach exit before time runs out (10 minutes)",
        ];
        yPos = 390;
        objectives.forEach((obj) => {
            context.fillText(obj, 110, yPos);
            yPos += 32;
        });

        const warningY = height - 120;
        context.fillStyle = "rgba(244, 67, 54, 0.2)";
        context.fillRect(width / 2 - 200, warningY, 400, 40);
        context.strokeStyle = "#f44336";
        context.lineWidth = 2;
        context.strokeRect(width / 2 - 200, warningY, 400, 40);
        context.fillStyle = "#f44336";
        context.font = "bold 18px Arial";
        context.textAlign = "center";
        context.fillText(
            "⚠️ Getting caught = Level restart!",
            width / 2,
            warningY + 27
        );

        context.fillStyle = "#4CAF50";
        context.font = "18px Arial";
        context.fillText(
            "Press ESC or ENTER to return",
            width / 2,
            height - 35
        );

        context.restore();
    }
}
