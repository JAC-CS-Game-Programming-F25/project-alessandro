import Tile from "./Tile.js";
import ItemType from "../enums/ItemType.js";
import { context } from "../globals.js";

/**
 * Manages interactable items in a room
 * Handles detection, collection, and rendering of interaction prompts
 */

export default class InteractableManager {
    constructor(room) {
        this.room = room;
        this.interactables = [];
        this.currentInteractable = null;
        this.interactionRange = 2.25;

        try {
            this.interactables = this.findInteractables();
        } catch (error) {
            console.error("Error finding interactables:", error);
            this.interactables = [];
        }
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

            // Store EXACT pixel coordinates (don't round to grid yet)
            // This preserves the precise placement from Tiled
            const pixelX = obj.x;
            const pixelY = obj.y;
            const pixelWidth = obj.width;
            const pixelHeight = obj.height;

            // Calculate center in grid coordinates (for distance checks)
            const centerX = (pixelX + pixelWidth / 2) / Tile.SIZE;
            const centerY = (pixelY + pixelHeight / 2) / Tile.SIZE;

            // Calculate bounding box in grid coordinates (for rendering debug)
            const gridX = pixelX / Tile.SIZE;
            const gridY = pixelY / Tile.SIZE;
            const gridWidth = pixelWidth / Tile.SIZE;
            const gridHeight = pixelHeight / Tile.SIZE;

            interactables.push({
                // Pixel coordinates (exact from Tiled)
                pixelX: pixelX,
                pixelY: pixelY,
                pixelWidth: pixelWidth,
                pixelHeight: pixelHeight,

                // Grid coordinates (for rendering/debug)
                x: gridX,
                y: gridY,
                width: gridWidth,
                height: gridHeight,

                // Center point (for distance calculations)
                centerX: centerX,
                centerY: centerY,

                // Item data
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
            painting: { type: ItemType.Painting, value: 200 },
            sculpture: { type: ItemType.Sculpture, value: 1000 },
            artifact: { type: ItemType.Artifact, value: 500 },
            souvenir: { type: ItemType.Souvenir, value: 100 },
        };

        return itemDataMap[typeValue] || null;
    }

    update(playerPosition, level = null) {
        this.currentInteractable = null;
        let closestDistance = this.interactionRange;

        // Calculate player's "interaction point" (center-bottom of sprite)
        const playerInteractX = playerPosition.x + 0.5; // Center of tile
        const playerInteractY = playerPosition.y + 1.0; // Bottom of tile (feet position)

        // Find closest interactable within range
        for (const interactable of this.interactables) {
            // Skip if already collected
            if (interactable.isCollected) continue;

            // Calculate distance from player's feet to item center
            const dx = interactable.centerX - playerInteractX;
            const dy = interactable.centerY - playerInteractY;
            const distance = Math.hypot(dx, dy);

            if (distance <= closestDistance) {
                closestDistance = distance;
                this.currentInteractable = interactable;
            }
        }

        // Add sparkles to nearby items (if level is provided)
        if (level?.particleSystem) {
            for (const interactable of this.interactables) {
                if (interactable.isCollected) continue;

                // Sparkle occasionally
                if (Math.random() < 0.05) {
                    // 5% chance per frame
                    level.particleSystem.sparkle(
                        interactable.pixelX,
                        interactable.pixelY,
                        interactable.pixelWidth,
                        interactable.pixelHeight
                    );
                }
            }
        }
    }

    /**
     * Collect the current interactable
     * Returns the item data with its index
     */
    collect() {
        const interactable = this.currentInteractable;

        // Get the index BEFORE marking as collected
        const index = this.interactables.indexOf(interactable);

        // Mark as collected FIRST
        interactable.isCollected = true;

        // Clear all tiles in the rectangular region using PIXEL coordinates
        this.clearRegion(
            interactable.pixelX,
            interactable.pixelY,
            interactable.pixelWidth,
            interactable.pixelHeight
        );

        // Clear current interactable reference
        this.currentInteractable = null;

        // Return item data WITH index
        return {
            value: interactable.value,
            type: interactable.type,
            index: index,
        };
    }

    /**
     * Clear all tiles in a rectangular region
     * Now works with pixel-precise coordinates from Tiled
     */
    clearRegion(pixelX, pixelY, pixelWidth, pixelHeight) {
        const layer = this.room.objectCollisionLayer;

        // Convert pixel bounds to tile bounds
        const startTileX = Math.floor(pixelX / Tile.SIZE);
        const startTileY = Math.floor(pixelY / Tile.SIZE);
        const endTileX = Math.floor((pixelX + pixelWidth) / Tile.SIZE);
        const endTileY = Math.floor((pixelY + pixelHeight) / Tile.SIZE);

        // Clear all tiles in the region
        for (let tileY = startTileY; tileY <= endTileY; tileY++) {
            for (let tileX = startTileX; tileX <= endTileX; tileX++) {
                const index = tileX + tileY * layer.width;
                if (index >= 0 && index < layer.tiles.length) {
                    layer.tiles[index] = null;
                }
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

        // Position prompt above the TOP-LEFT corner of the bounding box
        const promptWidth = 60;
        const promptHeight = 20;

        // Center the prompt horizontally over the item
        const itemCenterX =
            (interactable.x + interactable.width / 2) * Tile.SIZE;
        const itemTopY = interactable.y * Tile.SIZE;

        const promptX = itemCenterX;
        const promptY = itemTopY - 25; // 25 pixels above the item

        context.save();

        // Background box
        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(
            promptX - promptWidth / 2,
            promptY - promptHeight / 2,
            promptWidth,
            promptHeight
        );

        // Border
        context.strokeStyle = "#FFD700";
        context.lineWidth = 2;
        context.strokeRect(
            promptX - promptWidth / 2,
            promptY - promptHeight / 2,
            promptWidth,
            promptHeight
        );

        // Text
        context.fillStyle = "#FFFFFF";
        context.font = "bold 12px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Press E", promptX, promptY);

        context.restore();
    }

    /**
     * Debug: Render interaction range circle
     * Call this from PlayState.js: level.currentRoom.interactableManager.renderDebug(level.player.position)
     */
    renderDebug(playerPosition) {
        context.save();

        // Calculate player's interaction point
        const playerInteractX = (playerPosition.x + 0.5) * Tile.SIZE;
        const playerInteractY = (playerPosition.y + 1.0) * Tile.SIZE;

        // Draw interaction range circle
        context.strokeStyle = "rgba(0, 255, 0, 0.5)";
        context.lineWidth = 2;
        context.beginPath();
        context.arc(
            playerInteractX,
            playerInteractY,
            this.interactionRange * Tile.SIZE,
            0,
            Math.PI * 2
        );
        context.stroke();

        // Draw player interaction point
        context.fillStyle = "rgba(0, 255, 0, 1)";
        context.beginPath();
        context.arc(playerInteractX, playerInteractY, 3, 0, Math.PI * 2);
        context.fill();

        // Draw all interactables using EXACT pixel coordinates from Tiled
        this.interactables.forEach((interactable) => {
            if (interactable.isCollected) return;

            const itemX = interactable.pixelX + interactable.pixelWidth / 2;
            const itemY = interactable.pixelY + interactable.pixelHeight / 2;

            // Draw item bounds using PIXEL coordinates (exact from Tiled)
            const isCurrentInteractable =
                this.currentInteractable === interactable;
            context.strokeStyle = isCurrentInteractable
                ? "rgba(255, 215, 0, 1)"
                : "rgba(255, 255, 255, 0.3)";
            context.lineWidth = isCurrentInteractable ? 3 : 1;
            context.strokeRect(
                interactable.pixelX,
                interactable.pixelY,
                interactable.pixelWidth,
                interactable.pixelHeight
            );

            // Draw item center point
            context.fillStyle = isCurrentInteractable
                ? "rgba(255, 215, 0, 1)"
                : "rgba(255, 255, 255, 0.5)";
            context.beginPath();
            context.arc(itemX, itemY, 3, 0, Math.PI * 2);
            context.fill();

            // Draw line to current interactable
            if (isCurrentInteractable) {
                context.strokeStyle = "rgba(255, 255, 0, 0.8)";
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(playerInteractX, playerInteractY);
                context.lineTo(itemX, itemY);
                context.stroke();

                // Draw distance text
                const dx = interactable.centerX - (playerPosition.x + 0.5);
                const dy = interactable.centerY - (playerPosition.y + 1.0);
                const distance = Math.hypot(dx, dy).toFixed(2);

                context.fillStyle = "#FFD700";
                context.font = "12px Arial";
                context.textAlign = "center";
                context.fillText(`${distance} tiles`, itemX, itemY - 20);
            }
        });

        context.restore();
    }
}
