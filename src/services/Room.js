import Layer from "./Layer.js";
import TilesetManager from "./TilesetManager.js";
import GuardFactory from "./GuardFactory.js";
import InteractableManager from "./InteractableManager.js";

export default class Room {
    /**
     * Represents a single room in the museum
     * @param {object} roomDefinition - JSON from Tiled
     * @param {string} roomName - Identifier for this room
     * @param {TilesetManager} tilesetManager - Handles loading sprites from tilesets
     */
    constructor(roomDefinition, roomName, tilesetManager) {
        this.name = roomName;
        this.width = roomDefinition.width;
        this.height = roomDefinition.height;

        const sprites = tilesetManager.loadSpritesForRoom(roomDefinition);

        const floorLayer = roomDefinition.layers.find(
            (l) => l.name === "Floor"
        );
        const wallCollisionLayer = roomDefinition.layers.find(
            (l) => l.name === "Wall-Collision"
        );
        const objectCollisionLayer = roomDefinition.layers.find(
            (l) => l.name === "Room-Objects-Collision"
        );
        const walkUnderLayer = roomDefinition.layers.find(
            (l) => l.name === "Walk-Under"
        );
        const topmostLayer = roomDefinition.layers.find(
            (l) => l.name === "Topmost"
        );
        const itemsLayer = roomDefinition.layers.find(
            (l) => l.name === "Collectible-Items"
        );
        const guardsLayer = roomDefinition.layers.find(
            (l) => l.name === "Guards"
        );

        this.floorLayer = new Layer(floorLayer, sprites);
        this.wallCollisionLayer = new Layer(wallCollisionLayer, sprites);
        this.objectCollisionLayer = new Layer(objectCollisionLayer, sprites);
        this.walkUnderLayer = walkUnderLayer
            ? new Layer(walkUnderLayer, sprites)
            : null;
        this.topmostLayer = topmostLayer
            ? new Layer(topmostLayer, sprites)
            : null;

        this.collisionLayer = this.createCombinedCollisionLayer(
            roomDefinition.width,
            roomDefinition.height,
            [this.wallCollisionLayer, this.objectCollisionLayer]
        );

        this.itemsObjectLayer = itemsLayer;
        this.interactableManager = new InteractableManager(this);

        const guardFactory = new GuardFactory();
        this.guards =
            guardFactory.createGuardsFromObjectGroup(guardsLayer, null) || [];

        this.entryPoints = [];
        this.exitPoints = [];
    }

    /**
     * Create a virtual collision layer that combines multiple collision layers
     * This allows the player to check collision against both walls and objects
     */
    createCombinedCollisionLayer(width, height, collisionLayers) {
        const combinedTiles = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let hasTile = false;

                // Check if ANY collision layer has a tile at this position
                for (const layer of collisionLayers) {
                    const tile = layer.getTile(x, y);

                    // Check if tile exists AND has a non-zero ID
                    if (tile !== null && tile.id !== 0) {
                        hasTile = true;
                        break;
                    }
                }

                combinedTiles.push(hasTile ? { id: 1 } : null);
            }
        }

        // Return a simple object that mimics the Layer interface
        return {
            tiles: combinedTiles,
            width: width,
            height: height,
            getTile(x, y) {
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                    return null;
                }
                return this.tiles[x + y * this.width];
            },
        };
    }

    update(dt, player, level) {
        this.interactableManager.update(player.position);

        this.guards.forEach((guard) => {
            guard.level = level;
            guard.update(dt);
        });
    }

    render() {
        this.floorLayer.render();
        this.wallCollisionLayer.render();
        this.objectCollisionLayer.render();

        this.interactableManager.renderPrompt();

        if (this.walkUnderLayer) {
            this.walkUnderLayer.render();
        }

        if (this.topmostLayer) {
            this.topmostLayer.render();
        }
    }

    onItemCollected(item) {
        console.log(`Collected ${item.type} worth $${item.value}`);
    }
}
