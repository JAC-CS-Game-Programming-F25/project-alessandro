import Vector from "../../lib/Vector.js";
import Tile from "./Tile.js";

export default class RoomTransition {
    /**
     * Manages room connections and transitions
     * @param {Level} level
     */
    constructor(level) {
        this.level = level;
        this.transitions = [];
    }

    /**
     * Load transitions from Tiled object layer
     * @param {object} transitionsLayer - Object layer from Tiled
     */
    loadTransitions(transitionsLayer) {
        if (!transitionsLayer || transitionsLayer.type !== "objectgroup") {
            return;
        }

        this.transitions = [];

        transitionsLayer.objects.forEach((obj) => {
            const transition = this.parseTransition(obj);
            if (transition) {
                this.transitions.push(transition);
            }
        });

        console.log(`Loaded ${this.transitions.length} room transitions`);
    }

    /**
     * Parse a transition object from Tiled
     */
    parseTransition(tiledObject) {
        const properties = tiledObject.properties || [];

        const targetRoom = this.getPropertyValue(properties, "targetRoom");
        const spawnX = this.getPropertyValue(properties, "spawnX");
        const spawnY = this.getPropertyValue(properties, "spawnY");

        if (!targetRoom) {
            console.warn(
                "Transition missing targetRoom property:",
                tiledObject
            );
            return null;
        }

        // Special case: exit doesn't need spawn coordinates
        if (targetRoom === "exit") {
            const gridX = Math.floor(tiledObject.x / Tile.SIZE);
            const gridY = Math.floor(tiledObject.y / Tile.SIZE);
            const gridWidth = Math.ceil(tiledObject.width / Tile.SIZE);
            const gridHeight = Math.ceil(tiledObject.height / Tile.SIZE);

            return {
                x: gridX,
                y: gridY,
                width: gridWidth,
                height: gridHeight,
                targetRoom: "exit",
                spawnPosition: null, // No spawn needed for exit
            };
        }

        // For normal room transitions, spawnX and spawnY are required
        if (spawnX === null || spawnY === null) {
            console.warn(
                "Transition missing spawnX/spawnY properties:",
                tiledObject
            );
            return null;
        }

        // Convert pixel coordinates to grid
        const gridX = Math.floor(tiledObject.x / Tile.SIZE);
        const gridY = Math.floor(tiledObject.y / Tile.SIZE);
        const gridWidth = Math.ceil(tiledObject.width / Tile.SIZE);
        const gridHeight = Math.ceil(tiledObject.height / Tile.SIZE);

        return {
            x: gridX,
            y: gridY,
            width: gridWidth,
            height: gridHeight,
            targetRoom: targetRoom,
            spawnPosition: new Vector(Number.parseFloat(spawnX), Number.parseFloat(spawnY)),
        };
    }

    /**
     * Check if player is in any transition zone
     * @param {Vector} playerPosition - Player's grid position
     */
    checkTransitions(playerPosition) {
        for (const transition of this.transitions) {
            if (this.isPlayerInZone(playerPosition, transition)) {
                return transition;
            }
        }
        return null;
    }

    /**
     * Check if player is within a transition zone
     */
    isPlayerInZone(playerPos, zone) {
        return (
            playerPos.x >= zone.x &&
            playerPos.x < zone.x + zone.width &&
            playerPos.y >= zone.y &&
            playerPos.y < zone.y + zone.height
        );
    }

    getPropertyValue(properties, propertyName) {
        if (!properties) return null;

        const prop = properties.find((p) => p.name === propertyName);
        return prop ? prop.value : null;
    }
}
