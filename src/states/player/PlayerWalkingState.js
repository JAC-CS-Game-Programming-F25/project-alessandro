import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Player from "../../entities/Player.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Input from "../../../lib/Input.js";
import { input, timer } from "../../globals.js";
import Tile from "../../services/Tile.js";
import Easing from "../../../lib/Easing.js";

export default class PlayerWalkingState extends State {
    static WALK_ANIMATION_TIME = 0.1;
    /**
     * In this state, the player can move around using the
     * directional keys. From here, the player can go idle
     * if no keys are being pressed.
     *
     * @param {Player} player
     */
    constructor(player) {
        super();

        this.player = player;
        this.player.sprites = this.player.walkSprites;
        this.bottomLayer = this.player.map.bottomLayer;
        this.collisionLayer = this.player.map.collisionLayer;
        this.animation = {
            [Direction.Up]: new Animation(
                [6, 7, 8, 9, 10, 11],
                PlayerWalkingState.WALK_ANIMATION_TIME
            ),
            [Direction.Down]: new Animation(
                [18, 19, 20, 21, 22, 23],
                PlayerWalkingState.WALK_ANIMATION_TIME
            ),
            [Direction.Left]: new Animation(
                [12, 13, 14, 15, 16, 17],
                PlayerWalkingState.WALK_ANIMATION_TIME
            ),
            [Direction.Right]: new Animation(
                [0, 1, 2, 3, 4, 5],
                PlayerWalkingState.WALK_ANIMATION_TIME
            ),
        };

        this.isMoving = false;
    }

    enter() {
        this.player.sprites = this.player.walkSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update(dt) {
        this.player.currentAnimation = this.animation[this.player.direction];

        this.handleMovement();
    }

    handleMovement() {
        /**
         * Unlike Zelda, the Player's movement in Pokemon is locked to
         * the grid. To restrict them from moving freely, we set a flag
         * to track if they're currently moving from one tile to another,
         * and reject input if so.
         */
        if (this.isMoving) {
            return;
        }

        if (
            !input.isKeyHeld(Input.KEYS.W) &&
            !input.isKeyHeld(Input.KEYS.A) &&
            !input.isKeyHeld(Input.KEYS.S) &&
            !input.isKeyHeld(Input.KEYS.D)
        ) {
            this.player.changeState(PlayerStateName.Idling);
            return;
        }

        this.updateDirection();
        this.move();
    }

    updateDirection() {
        if (input.isKeyHeld(Input.KEYS.S)) {
            this.player.direction = Direction.Down;
        } else if (input.isKeyHeld(Input.KEYS.D)) {
            this.player.direction = Direction.Right;
        } else if (input.isKeyHeld(Input.KEYS.W)) {
            this.player.direction = Direction.Up;
        } else if (input.isKeyHeld(Input.KEYS.A)) {
            this.player.direction = Direction.Left;
        }
    }

    move() {
        let x = this.player.position.x;
        let y = this.player.position.y;

        switch (this.player.direction) {
            case Direction.Up:
                y--;
                break;
            case Direction.Down:
                y++;
                break;
            case Direction.Left:
                x--;
                break;
            case Direction.Right:
                x++;
                break;
        }

        if (!this.isValidMove(x, y)) {
            return;
        }

        this.player.position.x = x;
        this.player.position.y = y;

        this.tweenMovement(x, y);
    }

    tweenMovement(x, y) {
        this.isMoving = true;

        timer.tween(
            this.player.canvasPosition,
            { x: x * Tile.SIZE, y: y * Tile.SIZE },
            0.25,
            Easing.linear,
            () => {
                this.isMoving = false;
                this.updateDirection();
            }
        );
    }

    /**
     * @param {number} x
     * @param {number} y
     * @returns Whether the player is going to move on to a non-collidable tile.
     */
    isValidMove(x, y) {
        return this.collisionLayer.getTile(x, y) === null;
    }
}
