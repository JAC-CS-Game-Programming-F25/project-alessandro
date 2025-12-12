import Tile from "./Tile.js";
import ItemType from "../enums/ItemType.js";
import { context } from "../globals.js";

export default class InteractableManager {
    constructor(room) {
        this.room = room;
        this.interactables = this.findInteractables();
        this.currentInteractable = null;
        this.interactionRange = 1.5; // tiles
    }

    /**
     * Parse interactables from Tiled object layer
     */
    findInteractables() {
        const interactables = [];
        const itemsLayer = this.room.itemsObjectLayer;

        if (itemsLayer?.type !== "objectgroup") {
            return interactables;
        }

        itemsLayer.objects.forEach((obj) => {
            const itemData = this.getItemDataFromProperties(obj.properties);

            if (!itemData) return;

            // Convert pixel coordinates to grid
            const gridX = Math.floor(obj.x / Tile.SIZE);
            const gridY = Math.floor(obj.y / Tile.SIZE);
            const gridWidth = Math.ceil(obj.width / Tile.SIZE);
            const gridHeight = Math.ceil(obj.height / Tile.SIZE);

            interactables.push({
                x: gridX,
                y: gridY,
                width: gridWidth,
                height: gridHeight,
                centerX: gridX + gridWidth / 2,
                centerY: gridY + gridHeight / 2,
                value: itemData.value,
                type: itemData.type,
                isCollected: false,
            });
        });

        return interactables;
    }

    getItemDataFromProperties(properties) {
        if (!properties) return null;

        const typeProp = properties.find((p) => p.name === "type");
        if (!typeProp) return null;

        const typeValue = typeProp.value.toLowerCase();

        const itemDataMap = {
            painting: { type: ItemType.Painting, value: 1000 },
            sculpture: { type: ItemType.Sculpture, value: 2000 },
            artifact: { type: ItemType.Artifact, value: 500 },
            jewel: { type: ItemType.Jewel, value: 3000 },
        };

        return itemDataMap[typeValue] || null;
    }

    update(playerPosition) {
        this.currentInteractable = null;
        let closestDistance = this.interactionRange;

        // Find closest interactable within range
        for (const interactable of this.interactables) {
            if (interactable.isCollected) continue;

            const dx = interactable.centerX - playerPosition.x;
            const dy = interactable.centerY - playerPosition.y;
            const distance = Math.hypot(dx, dy);

            if (distance <= closestDistance) {
                closestDistance = distance;
                this.currentInteractable = interactable;
            }
        }
    }

    /**
     * Collect the current interactable
     */
    collect() {
        if (!this.currentInteractable || this.currentInteractable.isCollected) {
            return null;
        }

        const interactable = this.currentInteractable;
        interactable.isCollected = true;

        // Clear all tiles in the rectangular region
        this.clearRegion(
            interactable.x,
            interactable.y,
            interactable.width,
            interactable.height
        );

        return {
            value: interactable.value,
            type: interactable.type,
        };
    }

    /**
     * Clear all tiles in a rectangular region
     * This makes the item "disappear" when stolen
     */
    clearRegion(x, y, width, height) {
        const layer = this.room.objectCollisionLayer;

        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const tileX = x + dx;
                const tileY = y + dy;
                const index = tileX + tileY * layer.width;

                layer.tiles[index] = null;
            }
        }
    }

    canInteract() {
        return (
            this.currentInteractable !== null &&
            !this.currentInteractable.isCollected
        );
    }

    /**
     * Render interaction prompt above the item
     */
    renderPrompt() {
        if (!this.canInteract()) return;

        const interactable = this.currentInteractable;

        const x = interactable.centerX * Tile.SIZE;
        const y = interactable.y * Tile.SIZE - 10;

        context.save();

        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(x - 30, y - 15, 60, 20);

        context.strokeStyle = "#FFD700";
        context.lineWidth = 2;
        context.strokeRect(x - 30, y - 15, 60, 20);

        context.fillStyle = "#FFFFFF";
        context.font = "12px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Press E", x, y - 5);

        context.restore();
    }

    /**
     * Optional: Render highlight around interactable items
     */
    renderHighlight() {
        if (!this.canInteract()) return;

        const { context } = require("../globals.js");
        const interactable = this.currentInteractable;

        const x = interactable.x * Tile.SIZE;
        const y = interactable.y * Tile.SIZE;
        const width = interactable.width * Tile.SIZE;
        const height = interactable.height * Tile.SIZE;

        context.save();

        // Pulsing glow effect
        const pulseAlpha = 0.3 + Math.sin(Date.now() / 200) * 0.2;

        context.strokeStyle = `rgba(255, 215, 0, ${pulseAlpha})`;
        context.lineWidth = 3;
        context.strokeRect(x - 2, y - 2, width + 4, height + 4);

        context.restore();
    }
}
