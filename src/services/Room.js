import Layer from "./Layer.js";
import Tile from "./Tile.js";
import Item from "../objects/Item.js";
import ItemType from "../enums/ItemType.js";
import TilesetManager from "./TilesetManager.js";

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

        // Load sprites dynamically from all tilesets
        const sprites = tilesetManager.loadSpritesForRoom(roomDefinition);

        // Find layers by name
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

        this.floorLayer = new Layer(floorLayer, sprites);
        this.wallCollisionLayer = new Layer(wallCollisionLayer, sprites);
        this.objectCollisionLayer = new Layer(objectCollisionLayer, sprites);
        this.walkUnderLayer = walkUnderLayer
            ? new Layer(walkUnderLayer, sprites)
            : null;
        this.topmostLayer = topmostLayer
            ? new Layer(topmostLayer, sprites)
            : null;

        // Combine collision layers for player collision detection
        this.collisionLayer = this.createCombinedCollisionLayer(
            roomDefinition.width,
            roomDefinition.height,
            [this.wallCollisionLayer, this.objectCollisionLayer]
        );

        this.items = this.parseItemsFromObjectGroup(itemsLayer, sprites);

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
                    if (layer.getTile(x, y) !== null) {
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
                return this.tiles[x + y * this.width];
            },
        };
    }

    /**
     * Parse items from Tiled object group layer
     * @param {object} objectGroupLayer - The Items layer from Tiled
     * @param {array} sprites
     * @returns {array} Array of Item objects
     */
    parseItemsFromObjectGroup(objectGroupLayer, sprites) {
        if (!objectGroupLayer || objectGroupLayer.type !== "objectgroup") {
            return [];
        }

        const items = [];

        objectGroupLayer.objects.forEach((obj) => {
            const gridX = Math.floor(obj.x / Tile.SIZE);
            const gridY = Math.floor(obj.y / Tile.SIZE);

            const itemData = this.getItemDataFromProperties(obj.properties);

            if (itemData) {
                const item = new Item(
                    gridX,
                    gridY,
                    itemData.type,
                    itemData.value,
                    null // Placeholder for now
                );
                items.push(item);
            }
        });

        return items;
    }

    /**
     * Extract item data from Tiled object properties
     * @param {array} properties - Array of property objects from Tiled
     */
    getItemDataFromProperties(properties) {
        if (!properties) return null;

        const typeProp = properties.find((p) => p.name === "type");
        if (!typeProp) return null;

        const typeValue = typeProp.value.toLowerCase();

        const itemDataMap = {
            painting: { type: ItemType.Painting, value: 100 },
            sculpture: { type: ItemType.Sculpture, value: 500 },
            artifact: { type: ItemType.Artifact, value: 1000 },
            jewel: { type: ItemType.Jewel, value: 2000 },
        };

        return itemDataMap[typeValue] || null;
    }

    update(dt, player) {
        // Check for item collection
        this.items.forEach((item) => {
            if (item.checkPlayerCollision(player)) {
                item.collect();
                this.onItemCollected(item);
            }
        });
    }

    render() {
        // Render bottom layers
        this.floorLayer.render();
        this.wallCollisionLayer.render();
        this.objectCollisionLayer.render();

        // Items render here (before player)
        this.items.forEach((item) => item.render());

        // Player renders in Level.js between this and topmost layers

        // Render layers that should appear over the player
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
