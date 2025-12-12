import State from "../../../lib/State.js";
import GuardStateName from "../../enums/GuardStateName.js";

export default class GuardIdleState extends State {
    constructor(guard) {
        super();
        this.guard = guard;
        this.idleDuration = 7;
        this.elapsedTime = 0;
    }

    enter() {
        this.guard.sprites = this.guard.idleSprites;
        this.guard.currentAnimation =
            this.guard.idleAnimation[this.guard.direction];
        this.elapsedTime = 0;
    }

    update(dt) {
        this.elapsedTime += dt;

        if (this.elapsedTime >= this.idleDuration) {
            this.guard.changeState(GuardStateName.Rotating);
        }
    }
}
