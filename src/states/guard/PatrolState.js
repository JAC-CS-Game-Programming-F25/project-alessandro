import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import Tile from "../../services/Tile.js";

export default class PatrolState extends State {
    constructor(guard) {
        super();
        this.guard = guard;
        this.targetWaypoint = null;
        this.previousDirection = null; // Track direction changes
    }

    enter() {
        this.guard.sprites = this.guard.walkSprites;

        if (this.guard.waypoints.length > 0) {
            this.targetWaypoint = this.guard.getCurrentWaypoint();
        }

        this.previousDirection = this.guard.direction;
    }

    update(dt) {
        if (!this.targetWaypoint || this.guard.waypoints.length === 0) {
            return;
        }

        const dx = this.targetWaypoint.x - this.guard.position.x;
        const dy = this.targetWaypoint.y - this.guard.position.y;
        const distance = Math.hypot(dx, dy);

        if (distance < 0.1) {
            this.targetWaypoint = this.guard.getNextWaypoint();
            return;
        }

        const moveX = (dx / distance) * this.guard.moveSpeed * dt;
        const moveY = (dy / distance) * this.guard.moveSpeed * dt;

        this.guard.canvasPosition.x += moveX;
        this.guard.canvasPosition.y += moveY;

        this.guard.position.x = this.guard.canvasPosition.x / Tile.SIZE;
        this.guard.position.y = this.guard.canvasPosition.y / Tile.SIZE;

        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
            this.guard.direction = dx > 0 ? Direction.Right : Direction.Left;
        } else {
            this.guard.direction = dy > 0 ? Direction.Down : Direction.Up;
        }

        // Update vision cone rotation when direction changes
        if (this.guard.direction !== this.previousDirection) {
            if (this.guard.visionCone) {
                this.guard.visionCone.setTargetRotation(this.guard.direction);
            }
            this.previousDirection = this.guard.direction;
        }

        this.guard.currentAnimation =
            this.guard.walkAnimation[this.guard.direction];
    }
}
