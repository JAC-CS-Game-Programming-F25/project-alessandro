import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import Input from "../../../lib/Input.js";
import { input } from "../../globals.js";
import Tile from "../../services/Tile.js";
import GameEntity from "../../entities/GameEntity.js";

export default class PlayerWalkingState extends State {
    static WALK_ANIMATION_TIME = 0.1;

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
    }

    enter() {
        this.player.sprites = this.player.walkSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update(dt) {
        this.player.currentAnimation = this.animation[this.player.direction];
        this.handleMovement(dt);
    }

    handleMovement(dt) {
        // Reset velocity
        this.player.velocity.x = 0;
        this.player.velocity.y = 0;

        // Check if no keys are pressed
        if (
            !input.isKeyHeld(Input.KEYS.W) &&
            !input.isKeyHeld(Input.KEYS.A) &&
            !input.isKeyHeld(Input.KEYS.S) &&
            !input.isKeyHeld(Input.KEYS.D)
        ) {
            this.player.changeState(PlayerStateName.Idling);
            return;
        }

        this.setVelocity();
        this.normalizeDiagonalMovement();

        // Calculate next position
        const nextX =
            this.player.canvasPosition.x + this.player.velocity.x * dt;
        const nextY =
            this.player.canvasPosition.y + this.player.velocity.y * dt;

        // Check collision and adjust velocity
        if (this.willCollide(nextX, this.player.canvasPosition.y)) {
            this.player.velocity.x = 0;
        }

        if (this.willCollide(this.player.canvasPosition.x, nextY)) {
            this.player.velocity.y = 0;
        }
    }

    setVelocity() {
        if (input.isKeyHeld(Input.KEYS.W)) {
            this.player.velocity.y = -this.player.speed;
            this.player.direction = Direction.Up;
        }
        if (input.isKeyHeld(Input.KEYS.S)) {
            this.player.velocity.y = this.player.speed;
            this.player.direction = Direction.Down;
        }
        if (input.isKeyHeld(Input.KEYS.A)) {
            this.player.velocity.x = -this.player.speed;
            this.player.direction = Direction.Left;
        }
        if (input.isKeyHeld(Input.KEYS.D)) {
            this.player.velocity.x = this.player.speed;
            this.player.direction = Direction.Right;
        }
    }

    normalizeDiagonalMovement() {
        if (this.player.velocity.x !== 0 && this.player.velocity.y !== 0) {
            const length = Math.hypot(
                this.player.velocity.x,
                this.player.velocity.y
            );
            this.player.velocity.x =
                (this.player.velocity.x / length) * this.player.speed;
            this.player.velocity.y =
                (this.player.velocity.y / length) * this.player.speed;
        }
    }

    /**
     * Check if the player's hitbox will collide with any collision tiles
     * @param {number} x - Next X position in pixels
     * @param {number} y - Next Y position in pixels
     * @returns {boolean} - True if collision detected
     */
    willCollide(x, y) {
        // Define player hitbox (adjust these based on your sprite)
        const hitboxOffsetX = 4;
        const hitboxOffsetY = GameEntity.HEIGHT / 4;
        const hitboxWidth = 24;
        const hitboxHeight = 16;

        // Get the four corners of the hitbox
        const left = Math.floor((x + hitboxOffsetX) / Tile.SIZE);
        const right = Math.floor(
            (x + hitboxOffsetX + hitboxWidth - 1) / Tile.SIZE
        );
        const top = Math.floor((y + hitboxOffsetY) / Tile.SIZE);
        const bottom = Math.floor(
            (y + hitboxOffsetY + hitboxHeight - 1) / Tile.SIZE
        );

        // Check if any corner is in a collision tile
        return (
            this.collisionLayer.getTile(left, top) !== null ||
            this.collisionLayer.getTile(right, top) !== null ||
            this.collisionLayer.getTile(left, bottom) !== null ||
            this.collisionLayer.getTile(right, bottom) !== null
        );
    }
}
