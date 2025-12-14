import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";

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
    }

    update(dt) {
        if (this.player.currentAnimation.isDone()) {
            // Return to idle state
            this.player.changeState(PlayerStateName.Idling);
        }
    }
}
