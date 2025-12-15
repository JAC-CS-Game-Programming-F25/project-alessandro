import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import Input from "../../../lib/Input.js";
import { sounds, input } from "../../globals.js";
import Tile from "../../services/Tile.js";
import GameEntity from "../../entities/GameEntity.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import SoundName from "../../enums/SoundName.js";
import Hitbox from "../../../lib/Hitbox.js";

export default class PlayerMovingState extends State {
    constructor(player, speed, animationTime) {
        super();

        this.player = player;
        this.speed = speed;

        this.animation = {
            [Direction.Up]: new Animation([6, 7, 8, 9, 10, 11], animationTime),
            [Direction.Down]: new Animation(
                [18, 19, 20, 21, 22, 23],
                animationTime
            ),
            [Direction.Left]: new Animation(
                [12, 13, 14, 15, 16, 17],
                animationTime
            ),
            [Direction.Right]: new Animation([0, 1, 2, 3, 4, 5], animationTime),
        };

        this.footstepTimer = 0;
        this.footstepInterval = 0.3 * (player.speed / speed);
    }

    get collisionLayer() {
        return this.player.level.collisionLayer;
    }

    enter() {
        this.player.sprites = this.player.walkSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update(dt) {
        this.footstepTimer += dt;
        if (this.footstepTimer >= this.footstepInterval) {
            sounds.play(SoundName.Footsteps);
            this.footstepTimer = 0;
        }

        this.player.currentAnimation = this.animation[this.player.direction];

        if (input.isKeyPressed(Input.KEYS.E)) {
            this.handleInteraction();
        }

        if (this.shouldChangeState()) {
            return;
        }

        this.handleMovement(dt);
    }

    /**
     * Handle E key interaction with items
     */
    handleInteraction() {
        const room = this.player.level.currentRoom;

        if (room.interactableManager.canInteract()) {
            sounds.play(SoundName.MoneyPickup);
            this.player.changeState(PlayerStateName.Stealing);

            const itemData = room.interactableManager.collect();

            if (itemData) {
                if (room.onItemCollected) {
                    room.onItemCollected(itemData);
                }
            }
        }
    }

    shouldChangeState() {
        return false;
    }

    handleMovement(dt) {
        this.player.velocity.x = 0;
        this.player.velocity.y = 0;

        const isMoving =
            input.isKeyHeld(Input.KEYS.W) ||
            input.isKeyHeld(Input.KEYS.A) ||
            input.isKeyHeld(Input.KEYS.S) ||
            input.isKeyHeld(Input.KEYS.D);

        if (!isMoving) {
            this.player.velocity.x = 0;
            this.player.velocity.y = 0;
            this.onNoInput();
            return;
        }

        if (input.isKeyHeld(Input.KEYS.W)) {
            this.player.velocity.y = -this.speed;
            this.player.direction = Direction.Up;
        }
        if (input.isKeyHeld(Input.KEYS.S)) {
            this.player.velocity.y = this.speed;
            this.player.direction = Direction.Down;
        }
        if (input.isKeyHeld(Input.KEYS.A)) {
            this.player.velocity.x = -this.speed;
            this.player.direction = Direction.Left;
        }
        if (input.isKeyHeld(Input.KEYS.D)) {
            this.player.velocity.x = this.speed;
            this.player.direction = Direction.Right;
        }

        // Normalize diagonal movement
        if (this.player.velocity.x !== 0 && this.player.velocity.y !== 0) {
            const length = Math.hypot(
                this.player.velocity.x,
                this.player.velocity.y
            );
            this.player.velocity.x =
                (this.player.velocity.x / length) * this.speed;
            this.player.velocity.y =
                (this.player.velocity.y / length) * this.speed;
        }

        const nextX =
            this.player.canvasPosition.x + this.player.velocity.x * dt;
        const nextY =
            this.player.canvasPosition.y + this.player.velocity.y * dt;

        // Check X-axis collision using Hitbox
        if (this.checkTileCollision(nextX, this.player.canvasPosition.y)) {
            this.player.velocity.x = 0;
        }

        // Check Y-axis collision using Hitbox
        if (this.checkTileCollision(this.player.canvasPosition.x, nextY)) {
            this.player.velocity.y = 0;
        }
    }

    onNoInput() {
        
    }

    /**
     * Check if the player's hitbox would collide with tiles at a given position
     * Uses the Hitbox class from the course library for AABB collision detection
     */
    checkTileCollision(x, y) {
        const hitboxOffsetX = 4;
        const hitboxOffsetY = GameEntity.HEIGHT / 4;
        const hitboxWidth = 24;
        const hitboxHeight = 16;

        // Create a test hitbox at the proposed position
        const testHitbox = new Hitbox(
            x + hitboxOffsetX,
            y + hitboxOffsetY,
            hitboxWidth,
            hitboxHeight
        );

        // Check the four corners of the hitbox against tiles
        const left = Math.floor((x + hitboxOffsetX) / Tile.SIZE);
        const right = Math.floor(
            (x + hitboxOffsetX + hitboxWidth - 1) / Tile.SIZE
        );
        const top = Math.floor((y + hitboxOffsetY) / Tile.SIZE);
        const bottom = Math.floor(
            (y + hitboxOffsetY + hitboxHeight - 1) / Tile.SIZE
        );

        const tilesToCheck = [
            { x: left, y: top },
            { x: right, y: top },
            { x: left, y: bottom },
            { x: right, y: bottom },
        ];

        // Check collision with each tile using Hitbox.didCollide()
        for (const tilePos of tilesToCheck) {
            const tile = this.collisionLayer.getTile(tilePos.x, tilePos.y);

            if (tile !== null) {
                // Create a hitbox for this tile
                const tileHitbox = new Hitbox(
                    tilePos.x * Tile.SIZE,
                    tilePos.y * Tile.SIZE,
                    Tile.SIZE,
                    Tile.SIZE
                );

                // Use Hitbox class's didCollide() method for collision detection
                if (testHitbox.didCollide(tileHitbox)) {
                    return true;
                }
            }
        }

        return false;
    }
}
