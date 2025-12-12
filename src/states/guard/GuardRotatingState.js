import State from "../../../lib/State.js";
import GuardStateName from "../../enums/GuardStateName.js";

export default class GuardRotatingState extends State {
    constructor(guard) {
        super();
        this.guard = guard;
        this.rotationDelay = 0.5;
        this.elapsedTime = 0;
    }

    enter() {
        this.guard.sprites = this.guard.idleSprites;
        this.elapsedTime = 0;
        this.startDirection = this.guard.direction;

        // Get next direction from guard (uses weighted randomness for stationary guards)
        if (typeof this.guard.getNextDirection === "function") {
            this.targetDirection = this.guard.getNextDirection();
        } else {
            // Fallback: rotate 90 degrees clockwise
            this.targetDirection = (this.startDirection + 1) % 4;
        }

        if (this.guard.visionCone) {
            this.guard.visionCone.setTargetRotation(this.targetDirection);
        }
    }

    update(dt) {
        this.elapsedTime += dt;

        const progress = Math.min(this.elapsedTime / this.rotationDelay, 1.0);

        if (progress >= 0.5 && this.guard.direction !== this.targetDirection) {
            this.guard.direction = this.targetDirection;
            this.guard.currentAnimation =
                this.guard.idleAnimation[this.guard.direction];
        }

        if (this.elapsedTime >= this.rotationDelay) {
            this.guard.changeState(GuardStateName.Idle);
        }
    }

    exit() {
        this.guard.direction = this.targetDirection;
        this.guard.currentAnimation =
            this.guard.idleAnimation[this.guard.direction];
    }
}
