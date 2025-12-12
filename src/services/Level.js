import Player from "../entities/Player.js";
import Vector from "../../lib/Vector.js";
import Room from "./Room.js";
import TilesetManager from "./TilesetManager.js";

export default class Level {
    constructor() {
        this.rooms = new Map();
        this.currentRoom = null;
        this.player = null;
        this.moneyCollected = 0;
        this.quota = 10000;
        this.tilesetManager = new TilesetManager(); // Create once, reuse for all rooms
    }

    async loadRoom(roomName, jsonPath) {
        const roomData = await fetch(jsonPath).then((response) =>
            response.json()
        );
        const room = new Room(roomData, roomName, this.tilesetManager); // Pass the manager
        this.rooms.set(roomName, room);
        return room;
    }

    setCurrentRoom(roomName, playerSpawnPosition = null) {
        this.currentRoom = this.rooms.get(roomName);

        if (!this.currentRoom) {
            console.error(`Room ${roomName} not loaded!`);
            return;
        }

        if (!this.player) {
            this.player = new Player(
                { position: playerSpawnPosition || new Vector(8, 5) },
                this
            );
        } else if (playerSpawnPosition) {
            this.player.position = playerSpawnPosition;
            this.player.canvasPosition = new Vector(
                playerSpawnPosition.x * Tile.SIZE,
                playerSpawnPosition.y * Tile.SIZE
            );
        }
    }

    get collisionLayer() {
        return this.currentRoom?.collisionLayer;
    }

    update(dt) {
        if (!this.currentRoom || !this.player) return;

        this.player.update(dt);
        this.currentRoom.update(dt, this.player, this); // Pass 'this' as level reference

        this.currentRoom.onItemCollected = (item) => {
            this.moneyCollected += item.value;
            console.log(
                `Collected ${item.type} worth $${item.value}. Total: $${this.moneyCollected}`
            );
        };
    }

    render() {
        if (!this.currentRoom || !this.player) return;

        // 1. Render floor layers (behind everything)
        this.currentRoom.floorLayer.render();
        this.currentRoom.wallCollisionLayer.render();
        this.currentRoom.objectCollisionLayer.render();

        // 2. Render interaction prompt
        this.currentRoom.interactableManager.renderPrompt();

        // 3. Render guards (sprites only, no vision cones yet)
        if (this.currentRoom.guards && this.currentRoom.guards.length > 0) {
            this.currentRoom.guards.forEach((guard) => {
                const x = Math.floor(guard.canvasPosition.x);
                const y = Math.floor(
                    guard.canvasPosition.y - guard.dimensions.y / 2
                );
                guard.sprites[guard.currentFrame].render(x, y);
            });
        }

        // 4. Render player
        this.player.render();

        // 5. Render layers that should appear OVER the player
        if (this.currentRoom.walkUnderLayer) {
            this.currentRoom.walkUnderLayer.render();
        }

        if (this.currentRoom.topmostLayer) {
            this.currentRoom.topmostLayer.render();
        }

        // 6. Render vision cones LAST (above absolutely everything)
        if (this.currentRoom.guards && this.currentRoom.guards.length > 0) {
            this.currentRoom.guards.forEach((guard) => {
                if (guard.visionCone) {
                    guard.visionCone.render();
                }
            });
        }
    }
}
