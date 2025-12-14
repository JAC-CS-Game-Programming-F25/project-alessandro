import Sprite from "../../lib/Sprite.js";
import Tile from "./Tile.js";
import { images } from "../globals.js";

export default class TilesetManager {
    /**
     * Manages loading and organizing sprites from multiple tilesets
     * based on Tiled's tileset configuration
     */
    constructor() {
        this.tilesetMapping = this.createTilesetMapping();
    }

    /**
     * Map Tiled tileset file names to loaded image names
     */
    createTilesetMapping() {
        return {
            "museum-entrance-layer-1.tsj": "museum-entrance-layer-1",
            "museum-entrance-layer-2.tsj": "museum-entrance-layer-2",
            "museum-room-1-layer-1.tsj": "museum-room-1-layer-1",
            "museum-room-1-layer-2.tsj": "museum-room-1-layer-2",
            "museum-room-2-layer-1.tsj": "museum-room-2-layer-1",
            "museum-room-2-layer-2.tsj": "museum-room-2-layer-2",
            "museum-room-3-layer-1.tsj": "museum-room-3-layer-1",
            "museum-room-3-layer-2.tsj": "museum-room-3-layer-2",
            "museum-room-4-layer-1.tsj": "museum-room-4-layer-1",
            "museum-room-4-layer-2.tsj": "museum-room-4-layer-2",
            "room-builder.tsj": "room-builder",
        };
    }

    /**
     * Load all sprites from tilesets defined in the room JSON
     * @param {object} roomDefinition - The Tiled JSON data
     * @returns {array} Array of sprites indexed by global tile ID
     */
    loadSpritesForRoom(roomDefinition) {
        const allSprites = {};

        roomDefinition.tilesets.forEach((tilesetRef) => {
            const sprites = this.loadTilesetSprites(tilesetRef);
            const firstGid = tilesetRef.firstgid;

            sprites.forEach((sprite, index) => {
                const globalId = firstGid + index;
                allSprites[globalId] = sprite; // Store in object by ID
            });
        });

        return allSprites;
    }

    /**
     * Load sprites for a single tileset
     * @param {object} tilesetRef - Tileset reference from room JSON
     * @returns {array} Array of sprites for this tileset
     */
    loadTilesetSprites(tilesetRef) {
        const tilesetFileName = this.extractFileName(tilesetRef.source);
        const imageName = this.tilesetMapping[tilesetFileName];

        const image = images.get(imageName);

        return Sprite.generateSpritesFromSpriteSheet(
            image,
            Tile.SIZE,
            Tile.SIZE
        );
    }

    /**
     * Extract filename from a path
     * @param {string} path - e.g., "../assets/maps/tilesets/file.tsj"
     * @returns {string} - e.g., "file.tsj"
     */
    extractFileName(path) {
        return path.split("/").pop();
    }

    /**
     * Find the highest tile ID used in the room
     * This determines how large our sprite array needs to be
     * @param {object} roomDefinition
     * @returns {number}
     */
    getMaxTileId(roomDefinition) {
        let maxId = 0;

        roomDefinition.layers.forEach((layer) => {
            if (layer.type === "tilelayer" && layer.data) {
                layer.data.forEach((tileId) => {
                    if (tileId > maxId) {
                        maxId = tileId;
                    }
                });
            }
        });

        return maxId;
    }
}
