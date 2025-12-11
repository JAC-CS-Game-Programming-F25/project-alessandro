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
            "room-builder.tsj": "room-builder",
        };
    }

    /**
     * Load all sprites from tilesets defined in the room JSON
     * @param {object} roomDefinition - The Tiled JSON data
     * @returns {array} Array of sprites indexed by global tile ID
     */
    loadSpritesForRoom(roomDefinition) {
        if (!roomDefinition.tilesets || roomDefinition.tilesets.length === 0) {
            console.warn("No tilesets found in room definition");
            return [];
        }

        // Find the maximum tile ID used in this room to size our array
        const maxTileId = this.getMaxTileId(roomDefinition);
        const allSprites = new Array(maxTileId + 1).fill(null);

        // Process each tileset
        roomDefinition.tilesets.forEach((tilesetRef) => {
            const sprites = this.loadTilesetSprites(tilesetRef);
            const firstGid = tilesetRef.firstgid;

            // Place sprites at the correct indices based on firstgid
            sprites.forEach((sprite, index) => {
                const globalId = firstGid + index;
                allSprites[globalId] = sprite;
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
        // Extract the tileset filename from the source path
        // e.g., "../assets/maps/tilesets/museum-entrance-layer-1.tsj" -> "museum-entrance-layer-1.tsj"
        const tilesetFileName = this.extractFileName(tilesetRef.source);

        // Look up the image name from our mapping
        const imageName = this.tilesetMapping[tilesetFileName];

        if (!imageName) {
            console.error(
                `No image mapping found for tileset: ${tilesetFileName}`
            );
            console.log(
                "Available mappings:",
                Object.keys(this.tilesetMapping)
            );
            return [];
        }

        // Get the image
        const image = images.get(imageName);

        if (!image) {
            console.error(`Image not loaded: ${imageName}`);
            return [];
        }

        // Generate sprites from the tileset image
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