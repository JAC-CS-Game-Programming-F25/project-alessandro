import State from "../../../lib/State.js";

export default class GuardAlertState extends State {
    /**
     * Guard has detected the player - trigger game over
     *
     * @param {Guard} guard
     */
    constructor(guard) {
        super();
        this.guard = guard;
    }

    enter() {
        if (this.guard.level && this.guard.level.onPlayerCaught) {
            this.guard.level.onPlayerCaught();
        }
    }

    onPlayerCaught() {}
}
