export default class Tile {
    static SIZE = 32;

    /**
     * Represents one tile in a Layer and on the screen.
     *
     * @param {number} id - The global tile ID from Tiled
     * @param {array} sprites - Array of all sprites indexed by tile ID
     */
    constructor(id, sprites) {
        this.sprites = sprites;
        this.id = id;
    }

    render(x, y) {
        // Use the tile ID directly to index into the sprite array
        const sprite = this.sprites[this.id];

        if (sprite) {
            sprite.render(x * Tile.SIZE, y * Tile.SIZE);
        }
    }
}
