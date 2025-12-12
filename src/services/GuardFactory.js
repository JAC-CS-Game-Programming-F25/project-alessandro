import PatrolGuard from "../entities/PatrolGuard.js";
import StationaryGuard from "../entities/StationaryGuard.js";
import GuardType from "../enums/GuardType.js";
import Direction from "../enums/Direction.js";
import Vector from "../../lib/Vector.js";
import Tile from "./Tile.js";

export default class GuardFactory {
    /**
     * Factory for creating guards from Tiled object layers
     */
    constructor() {}

    /**
     * Create guards from a Tiled object group layer
     * @param {object} objectGroupLayer - The Guards layer from Tiled
     * @param {Level} level - Reference to the level
     * @returns {array} Array of Guard objects
     */
    createGuardsFromObjectGroup(objectGroupLayer, level) {
        const guards = [];

        objectGroupLayer.objects.forEach((obj) => {
            const guard = this.createGuardFromObject(obj, level);
            if (guard) {
                guards.push(guard);
            }
        });

        return guards;
    }

    /**
     * Create a single guard from a Tiled object
     * @param {object} tiledObject - Object from Tiled
     * @param {Level} level
     * @returns {Guard|null}
     */
    createGuardFromObject(tiledObject, level) {
        // Tiled gives us top-left corner in pixels
        // Add half a tile to get the center, then convert to grid coordinates
        const centerX = tiledObject.x + tiledObject.width / 2;
        const centerY = tiledObject.y + tiledObject.height / 2;

        const gridX = Math.floor(centerX / Tile.SIZE);
        const gridY = Math.floor(centerY / Tile.SIZE);

        const guardType = this.getPropertyValue(
            tiledObject.properties,
            "guardType"
        );
        const direction =
            this.getPropertyValue(tiledObject.properties, "direction") ||
            "down";

        const guardDefinition = {
            position: new Vector(gridX, gridY),
            direction: this.stringToDirection(direction),
        };

        switch (guardType.toLowerCase()) {
            case GuardType.Patrol:
                return this.createPatrolGuard(
                    tiledObject,
                    guardDefinition,
                    level
                );

            case GuardType.Stationary:
                return this.createStationaryGuard(
                    tiledObject,
                    guardDefinition,
                    level
                );

            default:
                return null;
        }
    }

    /**
     * Create a patrol guard with waypoints
     */
    createPatrolGuard(tiledObject, guardDefinition, level) {
        // Get waypoints from properties (comma-separated: "5,5;10,5;10,10;5,10")
        const waypointsStr = this.getPropertyValue(
            tiledObject.properties,
            "waypoints"
        );

        const waypoints = this.parseWaypoints(waypointsStr);

        return new PatrolGuard(guardDefinition, level, waypoints);
    }

    /**
     * Create a stationary guard
     */
    createStationaryGuard(tiledObject, guardDefinition, level) {
        const rotationSpeed =
            this.getPropertyValue(tiledObject.properties, "rotationSpeed") ||
            45;
        const primaryDirection = this.getPropertyValue(
            tiledObject.properties,
            "primaryDirection"
        );

        // If primaryDirection is specified, use it; otherwise use guard's starting direction
        const primaryDir = primaryDirection
            ? this.stringToDirection(primaryDirection)
            : guardDefinition.direction;

        return new StationaryGuard(
            guardDefinition,
            level,
            Number.parseFloat(rotationSpeed),
            primaryDir
        );
    }

    /**
     * Parse waypoints string into Vector array
     * Format: "5,5;10,5;10,10;5,10"
     */
    parseWaypoints(waypointsStr) {
        return waypointsStr.split(";").map((point) => {
            const [x, y] = point.split(",").map((n) => Number.parseFloat(n.trim()));
            return new Vector(x, y);
        });
    }

    /**
     * Convert direction string to Direction enum
     */
    stringToDirection(dirStr) {
        switch (dirStr.toLowerCase()) {
            case "up":
                return Direction.Up;
            case "down":
                return Direction.Down;
            case "left":
                return Direction.Left;
            case "right":
                return Direction.Right;
            default:
                return Direction.Down;
        }
    }

    /**
     * Get a property value from Tiled properties array
     */
    getPropertyValue(properties, propertyName) {
        if (!properties) return null;

        const prop = properties.find((p) => p.name === propertyName);
        return prop ? prop.value : null;
    }
}
