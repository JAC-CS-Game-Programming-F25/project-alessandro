import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayerStealingState extends State {
    static STEAL_ANIMATION_TIME = 0.1;

    constructor(player) {
        super();

        this.player = player;
        this.animation = {
            [Direction.Up]: new Animation(
                [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
                PlayerStealingState.STEAL_ANIMATION_TIME,
                1
            ),
            [Direction.Down]: new Animation(
                [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47],
                PlayerStealingState.STEAL_ANIMATION_TIME,
                1
            ),
            [Direction.Left]: new Animation(
                [24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35],
                PlayerStealingState.STEAL_ANIMATION_TIME,
                1
            ),
            [Direction.Right]: new Animation(
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
                PlayerStealingState.STEAL_ANIMATION_TIME,
                1
            ),
        };
    }

    enter() {
        this.player.sprites = this.player.stealSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
        this.player.currentAnimation.refresh();

        // Stop all movement during stealing
        this.player.velocity.x = 0;
        this.player.velocity.y = 0;
    }

    update(dt) {
        if (this.player.currentAnimation.isDone()) {
            // Check if player is still holding movement keys
            const isMoving =
                input.isKeyHeld(Input.KEYS.W) ||
                input.isKeyHeld(Input.KEYS.A) ||
                input.isKeyHeld(Input.KEYS.S) ||
                input.isKeyHeld(Input.KEYS.D);

            if (isMoving) {
                // If holding movement keys, go to walking state
                // Walking state will handle setting the velocity based on which keys are held
                this.player.changeState(PlayerStateName.Walking);
            } else if (input.isKeyHeld(Input.KEYS.SHIFT)) {
                // If holding shift, go to crouch
                this.player.changeState(PlayerStateName.Crouching);
            } else {
                // Otherwise go to idle
                this.player.changeState(PlayerStateName.Idling);
            }
        }
    }
}
