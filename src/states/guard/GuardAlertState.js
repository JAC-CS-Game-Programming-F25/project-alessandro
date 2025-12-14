import State from "../../../lib/State.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

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
        // Play caught animation on player
        if (this.guard.level?.player) {
            this.guard.level.player.changeState(PlayerStateName.Caught);
        }

        // Trigger game over after a brief delay
        if (this.guard.level?.onPlayerCaught) {
            setTimeout(() => {
                this.guard.level.onPlayerCaught();
            }, 500);
        }
    }

    onPlayerCaught() {}
}
