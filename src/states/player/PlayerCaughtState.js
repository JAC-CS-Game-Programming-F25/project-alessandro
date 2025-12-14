import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";

export default class PlayerCaughtState extends State {
    static CAUGHT_ANIMATION_TIME = 0.15;
    static CAUGHT_ANIMATION_CYCLES = 3;

    constructor(player) {
        super();

        this.player = player;
        this.animation = {
            [Direction.Up]: new Animation(
                [3, 4, 5],
                PlayerCaughtState.CAUGHT_ANIMATION_TIME,
                PlayerCaughtState.CAUGHT_ANIMATION_CYCLES
            ),
            [Direction.Down]: new Animation(
                [9, 10, 11],
                PlayerCaughtState.CAUGHT_ANIMATION_TIME,
                PlayerCaughtState.CAUGHT_ANIMATION_CYCLES
            ),
            [Direction.Left]: new Animation(
                [6, 7, 8],
                PlayerCaughtState.CAUGHT_ANIMATION_TIME,
                PlayerCaughtState.CAUGHT_ANIMATION_CYCLES
            ),
            [Direction.Right]: new Animation(
                [0, 1, 2],
                PlayerCaughtState.CAUGHT_ANIMATION_TIME,
                PlayerCaughtState.CAUGHT_ANIMATION_CYCLES
            ),
        };
    }

    enter() {
        this.player.sprites = this.player.caughtSprites;

        this.player.currentAnimation = this.animation[this.player.direction];

        this.player.currentAnimation.refresh();

        this.player.currentFrame =
            this.player.currentAnimation.getCurrentFrame();

        this.player.velocity.x = 0;
        this.player.velocity.y = 0;
    }

    update(dt) {
        // Make sure we update the current frame
        if (this.player.currentAnimation) {
            this.player.currentFrame =
                this.player.currentAnimation.getCurrentFrame();
        }
    }
}
