import Vector from "../../lib/Vector.js";
import Tile from "../services/Tile.js";
import { context } from "../globals.js";
import ItemType from "../enums/ItemType.js";

export default class Item {
    constructor(x, y, type, value, sprite = null) {
        this.position = new Vector(x, y);
        this.canvasPosition = new Vector(x * Tile.SIZE, y * Tile.SIZE);
        this.type = type;
        this.value = value;
        this.sprite = sprite;
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
            // Render actual sprite when available
            this.sprite.render(this.canvasPosition.x, this.canvasPosition.y);
        } else {
            // Render placeholder
            this.renderPlaceholder();
        }
    }

    renderPlaceholder() {
        context.save();

        // Different colors for different item types
        const colorMap = {
            [ItemType.Painting]: "#FF6B6B", // Red
            [ItemType.Sculpture]: "#4ECDC4", // Teal
            [ItemType.Artifact]: "#FFE66D", // Yellow
            [ItemType.Jewel]: "#A8E6CF", // Green
        };

        context.fillStyle = colorMap[this.type] || "#FFFFFF";
        context.fillRect(
            this.canvasPosition.x + 4,
            this.canvasPosition.y + 4,
            Tile.SIZE - 8,
            Tile.SIZE - 8
        );

        // Draw value text
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
