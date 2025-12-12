import State from "../../../lib/State.js";
import GuardStateName from "../../enums/GuardStateName.js";
import Direction from "../../enums/Direction.js";

export default class GuardRotatingState extends State {
    constructor(guard) {
        super();
        this.guard = guard;
        this.rotationDelay = 0.5; // Half second to complete rotation
        this.elapsedTime = 0;
    }

    enter() {
        this.guard.sprites = this.guard.idleSprites;
        this.elapsedTime = 0;
        this.startDirection = this.guard.direction;

        // Calculate target direction (rotate 90 degrees clockwise)
        this.targetDirection = (this.startDirection + 1) % 4;

        // Set vision cone target rotation
        if (this.guard.visionCone) {
            this.guard.visionCone.setTargetRotation(this.targetDirection);
        }
    }

    update(dt) {
        this.elapsedTime += dt;

        // Interpolate guard direction visually
        const progress = Math.min(this.elapsedTime / this.rotationDelay, 1.0);

        // Update guard's actual direction partway through
        if (progress >= 0.5 && this.guard.direction !== this.targetDirection) {
            this.guard.direction = this.targetDirection;
            this.guard.currentAnimation =
                this.guard.idleAnimation[this.guard.direction];
        }

        // Complete rotation
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
