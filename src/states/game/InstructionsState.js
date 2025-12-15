import State from "../../../lib/State.js";
import GameStateName from "../../enums/GameStateName.js";
import {
    context,
    input,
    setCanvasSize,
    MENU_CANVAS_WIDTH,
    MENU_CANVAS_HEIGHT,
    stateMachine,
    SCULPTURE_VALUE,
    ARTIFACT_VALUE,
    PAINTING_VALUE,
    SOUVENIR_VALUE,
    QUOTA,
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

        // Background
        const bgGrad = context.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#0a0a0a");
        bgGrad.addColorStop(1, "#1a1a2e");
        context.fillStyle = bgGrad;
        context.fillRect(0, 0, width, height);

        // Title box
        const titleBoxX = width / 2 - 250;
        const titleBoxY = 25;
        const titleBoxWidth = 500;
        const titleBoxHeight = 65;

        context.fillStyle = "rgba(76, 175, 80, 0.2)";
        context.fillRect(titleBoxX, titleBoxY, titleBoxWidth, titleBoxHeight);
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 3;
        context.strokeRect(titleBoxX, titleBoxY, titleBoxWidth, titleBoxHeight);

        context.fillStyle = "#4CAF50";
        context.font = "bold 40px Orbitron";
        context.textAlign = "center";
        context.fillText("HOW TO PLAY", width / 2, titleBoxY + 45);

        // Column setup
        const columnStartY = 110;
        const columnGap = 20;
        const leftColX = 50;
        const leftColWidth = (width - 100 - columnGap) / 2;
        const rightColX = leftColX + leftColWidth + columnGap;
        const rightColWidth = leftColWidth;

        // LEFT COLUMN - Controls section
        const controlsY = columnStartY;
        const controlsHeight = 170;

        context.fillStyle = "rgba(33, 150, 243, 0.2)";
        context.fillRect(leftColX, controlsY, leftColWidth, controlsHeight);
        context.strokeStyle = "#2196F3";
        context.lineWidth = 2;
        context.strokeRect(leftColX, controlsY, leftColWidth, controlsHeight);

        context.fillStyle = "#2196F3";
        context.font = "bold 22px Orbitron";
        context.textAlign = "left";
        context.fillText("CONTROLS", leftColX + 20, controlsY + 30);

        context.fillStyle = "#fff";
        context.font = "16px RobotoMono";
        context.fillText(
            "WASD - Move your character",
            leftColX + 20,
            controlsY + 60
        );
        context.fillText(
            "SHIFT - Crouch (slower,",
            leftColX + 20,
            controlsY + 85
        );
        context.fillText(
            "        harder to detect)",
            leftColX + 20,
            controlsY + 105
        );
        context.fillText(
            "E - Pick up valuable items",
            leftColX + 20,
            controlsY + 130
        );
        context.fillText("ESC - Pause game", leftColX + 20, controlsY + 155);

        // RIGHT COLUMN - Item Values section
        const itemY = columnStartY;
        const itemHeight = 170;

        context.fillStyle = "rgba(255, 193, 7, 0.2)";
        context.fillRect(rightColX, itemY, rightColWidth, itemHeight);
        context.strokeStyle = "#FFC107";
        context.lineWidth = 2;
        context.strokeRect(rightColX, itemY, rightColWidth, itemHeight);

        context.fillStyle = "#FFC107";
        context.font = "bold 22px Orbitron";
        context.fillText("ITEM VALUES", rightColX + 20, itemY + 30);

        context.fillStyle = "#fff";
        context.font = "16px RobotoMono";
        context.fillText(
            `Sculpture $${SCULPTURE_VALUE}`,
            rightColX + 20,
            itemY + 65
        );
        context.fillText(
            `Artifact: $${ARTIFACT_VALUE}`,
            rightColX + 20,
            itemY + 95
        );
        context.fillText(
            `Painting: $${PAINTING_VALUE}`,
            rightColX + 20,
            itemY + 125
        );
        context.fillText(
            `Souvenir: $${SOUVENIR_VALUE}`,
            rightColX + 20,
            itemY + 155
        );

        // FULL WIDTH - Objective section
        const objY = controlsY + controlsHeight + 20;
        const objHeight = 120;
        const objWidth = width - 100;
        const objX = 50;

        context.fillStyle = "rgba(76, 175, 80, 0.2)";
        context.fillRect(objX, objY, objWidth, objHeight);
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 2;
        context.strokeRect(objX, objY, objWidth, objHeight);

        context.fillStyle = "#4CAF50";
        context.font = "bold 22px Orbitron";
        context.textAlign = "left";
        context.fillText("OBJECTIVE", objX + 20, objY + 30);

        context.fillStyle = "#fff";
        context.font = "16px RobotoMono";
        context.fillText(
            `- Steal items worth $${QUOTA} to unlock the exit`,
            objX + 20,
            objY + 60
        );
        context.fillText(
            "- Avoid guard vision cones and security cameras",
            objX + 20,
            objY + 85
        );

        // FULL WIDTH - Warning box
        const warnY = objY + objHeight + 20;
        const warnWidth = width - 100;
        const warnX = 50;
        const warnHeight = 60;

        context.fillStyle = "rgba(244, 67, 54, 0.3)";
        context.fillRect(warnX, warnY, warnWidth, warnHeight);
        context.strokeStyle = "#f44336";
        context.lineWidth = 2;
        context.strokeRect(warnX, warnY, warnWidth, warnHeight);

        context.fillStyle = "#f44336";
        context.font = "bold 18px Orbitron";
        context.textAlign = "center";
        context.fillText(
            "WARNING: Getting caught = Level restart!",
            width / 2,
            warnY + 25
        );

        context.font = "14px RobotoMono";
        context.fillText(
            "Reach exit before time runs out",
            width / 2,
            warnY + 45
        );

        // Return instruction
        const returnY = warnY + warnHeight + 50;
        context.fillStyle = "#4CAF50";
        context.font = "bold 14px RobotoMono";
        context.fillText(
            "Press ESC or ENTER to return to menu",
            width / 2,
            returnY
        );

        context.restore();
    }
}
