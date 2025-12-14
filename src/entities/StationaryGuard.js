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
    constructor(
        guardDefinition,
        level,
        rotationSpeed = 45,
        primaryDirection = null
    ) {
        super(guardDefinition, level);

        this.rotationSpeed = rotationSpeed;
        this.rotationAngle = 0;
        this.primaryDirection = primaryDirection ?? guardDefinition.direction;
        this.primaryDirectionChance = 0.85;

        this.visionCone = new VisionCone(
            this.position,
            this.direction,
            this.detectionRange,
            this.detectionAngle,
            true
        );

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

    /**
     * Determine next rotation direction with weighted randomness
     * Favors returning to primary direction
     */
    getNextDirection() {
        const random = Math.random();

        // 70% chance to rotate toward primary direction
        if (random < this.primaryDirectionChance) {
            return this.getDirectionTowardPrimary();
        } else {
            // 30% chance to rotate in a random direction
            return this.getRandomDirection();
        }
    }

    /**
     * Calculate which direction to rotate to get closer to primary direction
     */
    getDirectionTowardPrimary() {
        // If already at primary direction, rotate to a random direction
        if (this.direction === this.primaryDirection) {
            return this.getRandomDirection();
        }

        // Calculate shortest rotation to primary direction
        const diff = (this.primaryDirection - this.direction + 4) % 4;

        // Rotate clockwise (1 step)
        if (diff === 1 || diff === 2) {
            return (this.direction + 1) % 4;
        } else {
            // Rotate counter-clockwise (which is 3 steps clockwise in our 4-direction system)
            return (this.direction + 3) % 4;
        }
    }

    /**
     * Get a random direction (excluding current)
     */
    getRandomDirection() {
        const directions = [
            Direction.Up,
            Direction.Down,
            Direction.Left,
            Direction.Right,
        ];
        const otherDirections = directions.filter((d) => d !== this.direction);
        return otherDirections[
            Math.floor(Math.random() * otherDirections.length)
        ];
    }
}
