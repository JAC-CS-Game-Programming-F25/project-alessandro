import GameEntity from "./GameEntity.js";
import StateMachine from "../../lib/StateMachine.js";
import Vector from "../../lib/Vector.js";
import Direction from "../enums/Direction.js";
import Sprite from "../../lib/Sprite.js";
import { images } from "../globals.js";
import ImageName from "../enums/ImageName.js";

export default class Guard extends GameEntity {
    constructor(guardDefinition = {}, level) {
        super(guardDefinition);
        this.level = level;
        this.dimensions = new Vector(GameEntity.WIDTH, GameEntity.HEIGHT);

        this.detectionRange = guardDefinition.detectionRange ?? 5;
        this.detectionAngle = guardDefinition.detectionAngle ?? 60;

        this.visionCone = null;

        // Load guard sprites
        this.idleSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.GuardIdle),
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );

        this.walkSprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.GuardWalk),
            GameEntity.WIDTH,
            GameEntity.HEIGHT
        );

        this.sprites = this.idleSprites;
        this.currentFrame = 0;
        this.currentAnimation = null;

        this.stateMachine = null;
    }

    update(dt) {
        super.update(dt);

        if (this.currentAnimation) {
            this.currentAnimation.update(dt);
            this.currentFrame = this.currentAnimation.getCurrentFrame();
        }

        if (this.visionCone) {
            // Update vision cone range based on whether player is crouching
            if (this.level && this.level.player) {
                const detectionMultiplier = this.level.player.isCrouching
                    ? 0.6
                    : 1.0;
                this.visionCone.setDetectionMultiplier(detectionMultiplier);
            }

            this.visionCone.update(this.position, this.direction, dt);
        }
    }

    render() {
        const x = Math.floor(this.canvasPosition.x);
        const y = Math.floor(this.canvasPosition.y - this.dimensions.y / 2);

        this.sprites[this.currentFrame].render(x, y);
    }

    checkPlayerDetection(player) {
        if (!this.visionCone) return false;

        const detectionMultiplier = player.isCrouching ? 0.6 : 1.0;

        // Pass the collision layer for line-of-sight checking
        const collisionLayer = this.level?.collisionLayer;

        return this.visionCone.containsPoint(
            player.canvasPosition.x + 16,
            player.canvasPosition.y + 32,
            detectionMultiplier,
            collisionLayer
        );
    }
}
