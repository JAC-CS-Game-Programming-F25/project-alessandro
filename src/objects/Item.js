import GameObject from "./GameObject.js";
import Vector from "../../lib/Vector.js";
import Tile from "../services/Tile.js";
import { context } from "../globals.js";
import ItemType from "../enums/ItemType.js";

export default class Item extends GameObject {
    constructor(x, y, type, value, sprite = null) {
        super({
            position: new Vector(x, y),
            sprite: sprite,
        });

        this.type = type;
        this.value = value;
        this.isCollected = false;

        this.hitbox = {
            x: this.canvasPosition.x + 4,
            y: this.canvasPosition.y + 4,
            width: Tile.SIZE - 8,
            height: Tile.SIZE - 8,
        };
    }

    render() {
        if (this.isCollected) return;

        if (this.sprite) {
            super.render();
        } else {
            this.renderPlaceholder();
        }
    }

    renderPlaceholder() {
        context.save();

        const colorMap = {
            [ItemType.Painting]: "#FF6B6B",
            [ItemType.Sculpture]: "#4ECDC4",
            [ItemType.Artifact]: "#FFE66D",
            [ItemType.Souvenir]: "#A8E6CF",
        };

        context.fillStyle = colorMap[this.type] || "#FFFFFF";
        context.fillRect(
            this.canvasPosition.x + 4,
            this.canvasPosition.y + 4,
            Tile.SIZE - 8,
            Tile.SIZE - 8
        );

        context.fillStyle = "#000000";
        context.font = "10px Arial";
        context.textAlign = "center";
        context.fillText(
            `$${this.value}`,
            this.canvasPosition.x + Tile.SIZE / 2,
            this.canvasPosition.y + Tile.SIZE / 2 + 3
        );

        context.restore();
    }

    checkPlayerCollision(player) {
        if (this.isCollected) return false;

        const playerHitbox = {
            x: player.canvasPosition.x + 4,
            y: player.canvasPosition.y + 32,
            width: 24,
            height: 16,
        };

        return this.isOverlapping(playerHitbox, this.hitbox);
    }

    isOverlapping(box1, box2) {
        return (
            box1.x < box2.x + box2.width &&
            box1.x + box1.width > box2.x &&
            box1.y < box2.y + box2.height &&
            box1.y + box1.height > box2.y
        );
    }

    collect() {
        this.isCollected = true;
    }
}
