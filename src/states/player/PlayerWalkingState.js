import PlayerMovingState from "./PlayerMovingState.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Input from "../../../lib/Input.js";
import { input } from "../../globals.js";

export default class PlayerWalkingState extends PlayerMovingState {
    static WALK_ANIMATION_TIME = 0.1;

    constructor(player) {
        super(player, player.speed, PlayerWalkingState.WALK_ANIMATION_TIME);
    }

    enter() {
        super.enter();
        this.player.isCrouching = false;
    }

    /**
     * Check if we should transition to a different state
     */
    shouldChangeState() {
        // Check if shift is pressed to enter crouching state
        if (input.isKeyHeld(Input.KEYS.SHIFT)) {
            this.player.changeState(PlayerStateName.Crouching);
            return true;
        }

        return false;
    }

    /**
     * When no movement keys are pressed, go to idle
     */
    onNoInput() {
        this.player.changeState(PlayerStateName.Idling);
    }
}
