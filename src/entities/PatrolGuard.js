import Guard from "./Guard.js";
import VisionCone from "../objects/VisionCone.js";
import StateMachine from "../../lib/StateMachine.js";
import GuardStateName from "../enums/GuardStateName.js";
import PatrolState from "../states/guard/PatrolState.js";
import GuardAlertState from "../states/guard/GuardAlertState.js";
import Animation from "../../lib/Animation.js";
import Direction from "../enums/Direction.js";

export default class PatrolGuard extends Guard {
    constructor(guardDefinition, level, waypoints = []) {
        super(guardDefinition, level);

        this.waypoints = waypoints;
        this.currentWaypointIndex = 0;
        this.moveSpeed = 30;

        this.visionCone = new VisionCone(
            this.position,
            this.direction,
            this.detectionRange,
            this.detectionAngle,
            false
        );

        // Setup animations
        this.walkAnimation = {
            [Direction.Up]: new Animation([6, 7, 8, 9, 10, 11], 0.15),
            [Direction.Down]: new Animation([18, 19, 20, 21, 22, 23], 0.15),
            [Direction.Left]: new Animation([12, 13, 14, 15, 16, 17], 0.15),
            [Direction.Right]: new Animation([0, 1, 2, 3, 4, 5], 0.15),
        };

        this.stateMachine = this.initializeStateMachine();
    }

    initializeStateMachine() {
        const stateMachine = new StateMachine();

        stateMachine.add(GuardStateName.Patrol, new PatrolState(this));
        stateMachine.add(GuardStateName.Alert, new GuardAlertState(this));

        stateMachine.change(GuardStateName.Patrol);

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

    getNextWaypoint() {
        this.currentWaypointIndex =
            (this.currentWaypointIndex + 1) % this.waypoints.length;
        return this.waypoints[this.currentWaypointIndex];
    }

    getCurrentWaypoint() {
        return this.waypoints[this.currentWaypointIndex];
    }
}
