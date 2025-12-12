import Vector from "../../lib/Vector.js";
import Tile from "../services/Tile.js";

export default class GameObject {
    /**
     * Base class for non-moving game objects (items, exits, etc.)
     * Things that exist in the world but don't move or have complex AI
     *
     * @param {object} definition
     */
    constructor(definition = {}) {
        this.position = definition.position ?? new Vector();
        this.canvasPosition = new Vector(
            Math.floor(this.position.x * Tile.SIZE),
            Math.floor(this.position.y * Tile.SIZE)
        );
        this.dimensions =
            definition.dimensions ?? new Vector(Tile.SIZE, Tile.SIZE);
        this.sprite = definition.sprite ?? null;
        this.hitbox = definition.hitbox ?? null;
    }

    /**
     * Override in subclasses if needed
     */
    update(dt) {
        // Most game objects don't need updates
    }

    /**
     * Override in subclasses
     */
    render() {
        if (this.sprite) {
            this.sprite.render(this.canvasPosition.x, this.canvasPosition.y);
        }
    }
}
