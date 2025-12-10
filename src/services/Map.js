//import Colour from "../enums/Colour.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import Player from "../entities/Player.js";
import ImageName from "../enums/ImageName.js";
import Tile from "./Tile.js";
import Layer from "./Layer.js";
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    context,
    DEBUG,
    images,
    input,
} from "../globals.js";
import Input from "../../lib/Input.js";

export default class Map {
    /**
     * The collection of layers, sprites,
     * and characters that comprises the world.
     *
     * @param {object} mapDefinition JSON from Tiled map editor.
     */
    constructor(mapDefinition) {
        const sprites = Sprite.generateSpritesFromSpriteSheet(
            images.get(ImageName.MuseumEntrance),
            Tile.SIZE,
            Tile.SIZE
        );

        this.bottomLayer = new Layer(
            mapDefinition.layers[Layer.BOTTOM],
            sprites
        );
        this.collisionLayer = new Layer(
            mapDefinition.layers[Layer.COLLISION],
            sprites
        );
        this.topLayer = new Layer(mapDefinition.layers[Layer.TOP], sprites);
        this.player = new Player({ position: new Vector(8, 5) }, this);

        this.renderBottomLayer = true;
        this.renderCollisionLayer = true;
        this.renderTopLayer = true;
    }

    update(dt) {
        this.player.update(dt);

        if (input.isKeyPressed(Input.KEYS.NUMROW_1)) {
            this.renderBottomLayer = !this.renderBottomLayer;
        } else if (input.isKeyPressed(Input.KEYS.NUMROW_2)) {
            this.renderCollisionLayer = !this.renderCollisionLayer;
        } else if (input.isKeyPressed(Input.KEYS.NUMROW_3)) {
            this.renderTopLayer = !this.renderTopLayer;
        }
    }

    render() {
        if (this.renderBottomLayer) {
            this.bottomLayer.render();
        }

        if (this.renderCollisionLayer) {
            this.collisionLayer.render();
        }

        this.player.render();

        if (this.renderTopLayer) {
            this.topLayer.render();
        }

        Map.renderInstructions();

        if (DEBUG) {
            Map.renderGrid();
        }
    }

    /**
     * Draws a grid of squares on the screen to help with debugging.
     */
    static renderGrid() {
        context.save();
        context.strokeStyle = Colour.White;

        for (let y = 1; y < CANVAS_HEIGHT / Tile.SIZE; y++) {
            context.beginPath();
            context.moveTo(0, y * Tile.SIZE);
            context.lineTo(CANVAS_WIDTH, y * Tile.SIZE);
            context.closePath();
            context.stroke();

            for (let x = 1; x < CANVAS_WIDTH / Tile.SIZE; x++) {
                context.beginPath();
                context.moveTo(x * Tile.SIZE, 0);
                context.lineTo(x * Tile.SIZE, CANVAS_HEIGHT);
                context.closePath();
                context.stroke();
            }
        }

        context.restore();
    }

    static renderInstructions() {
        context.save();
        context.translate(0, Tile.SIZE * 9);
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, Tile.SIZE * 5, Tile.SIZE * 2);
        context.font = `12px PowerRed`;
        context.textBaseline = "alphabetic";
        context.fillStyle = "white";
        [
            `[1] Toggle Bottom Layer`,
            `[2] Toggle Collision Layer`,
            `[3] Toggle Top Layer`,
        ].forEach((text, index) => context.fillText(text, 15, index * 16 + 22));
        context.restore();
    }
}
