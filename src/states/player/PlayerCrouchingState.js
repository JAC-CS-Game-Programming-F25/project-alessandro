import PlayerMovingState from "./PlayerMovingState.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Input from "../../../lib/Input.js";
import { input } from "../../globals.js";

export default class PlayerCrouchingState extends PlayerMovingState {
    static CROUCH_ANIMATION_TIME = 0.5;
    static CROUCH_SPEED_MULTIPLIER = 0.5;

    constructor(player) {
        const crouchSpeed =
            player.speed * PlayerCrouchingState.CROUCH_SPEED_MULTIPLIER;
        super(player, crouchSpeed, PlayerCrouchingState.CROUCH_ANIMATION_TIME);
    }

    enter() {
        super.enter();
        this.player.isCrouching = true;
    }

    /**
     * Check if we should transition to a different state
     */
    shouldChangeState() {
        // If shift is released, go back to walking or idling
        if (!input.isKeyHeld(Input.KEYS.SHIFT)) {
            // Check if still moving
            if (
                input.isKeyHeld(Input.KEYS.W) ||
                input.isKeyHeld(Input.KEYS.A) ||
                input.isKeyHeld(Input.KEYS.S) ||
                input.isKeyHeld(Input.KEYS.D)
            ) {
                this.player.changeState(PlayerStateName.Walking);
            } else {
                this.player.changeState(PlayerStateName.Idling);
            }
            return true;
        }

        return false;
    }

    /**
     * When no movement keys are pressed while crouching, stay in crouch state
     * (don't transition to idle - player is still holding shift)
     */
    onNoInput() {
        // Stay in crouching state but stationary
    }
}
