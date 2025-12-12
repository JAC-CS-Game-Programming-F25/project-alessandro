import Guard from "./Guard.js";
import VisionCone from "../objects/VisionCone.js";
import StateMachine from "../../lib/StateMachine.js";
import GuardStateName from "../enums/GuardStateName.js";
import GuardIdleState from "../states/guard/GuardIdleState.js";
import GuardRotatingState from "../states/guard/GuardRotatingState.js";
import GuardAlertState from "../states/guard/GuardAlertState.js";
import Animation from "../../lib/Animation.js";
import Direction from "../enums/Direction.js";

export default class StationaryGuard extends Guard {
    constructor(guardDefinition, level, rotationSpeed = 45) {
        super(guardDefinition, level);

        this.rotationSpeed = rotationSpeed;
        this.rotationAngle = 0;

        this.visionCone = new VisionCone(
            this.position,
            this.direction,
            this.detectionRange,
            this.detectionAngle,
            true
        );

        // Setup idle animations
        this.idleAnimation = {
            [Direction.Up]: new Animation([6, 7, 8, 9, 10, 11], 0.2),
            [Direction.Down]: new Animation([18, 19, 20, 21, 22, 23], 0.2),
            [Direction.Left]: new Animation([12, 13, 14, 15, 16, 17], 0.2),
            [Direction.Right]: new Animation([0, 1, 2, 3, 4, 5], 0.2),
        };

        this.stateMachine = this.initializeStateMachine();
    }

    initializeStateMachine() {
        const stateMachine = new StateMachine();

        stateMachine.add(GuardStateName.Idle, new GuardIdleState(this));
        stateMachine.add(GuardStateName.Rotating, new GuardRotatingState(this));
        stateMachine.add(GuardStateName.Alert, new GuardAlertState(this));

        stateMachine.change(GuardStateName.Idle);

        return stateMachine;
    }

    update(dt) {
        super.update(dt);

        if (this.level.player && this.checkPlayerDetection(this.level.player)) {
            if (this.stateMachine.currentState.name !== GuardStateName.Alert) {
                this.stateMachine.change(GuardStateName.Alert);
            }
        }
    }
}
