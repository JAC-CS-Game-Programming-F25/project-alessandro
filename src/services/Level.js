import Player from "../entities/Player.js";
import Vector from "../../lib/Vector.js";
import Room from "./Room.js";
import TilesetManager from "./TilesetManager.js";
import { setCanvasSize } from "../globals.js";
import Tile from "./Tile.js";

export default class Level {
    static QUOTA = 10000;

    constructor() {
        this.rooms = new Map();
        this.currentRoom = null;
        this.player = null;
        this.moneyCollected = 0;
        this.quota = Level.QUOTA;
        this.tilesetManager = new TilesetManager();

        this.transitionCooldown = 0;
        this.transitionCooldownTime = 0.5;

        this.playerReachedExit = false;
        this.onPlayerCaught = null;
    }

    async loadRoom(roomName, jsonPath) {
        const roomData = await fetch(jsonPath).then((response) =>
            response.json()
        );
        const room = new Room(roomData, roomName, this.tilesetManager);

        room.roomTransition.level = this;

        this.rooms.set(roomName, room);
        return room;
    }

    setCurrentRoom(roomName, playerSpawnPosition = null) {
        this.currentRoom = this.rooms.get(roomName);

        setCanvasSize(
            this.currentRoom.pixelWidth,
            this.currentRoom.pixelHeight
        );

        if (!this.player) {
            this.player = new Player(
                { position: playerSpawnPosition || new Vector(8, 5) },
                this
            );
        } else if (playerSpawnPosition) {
            // Clone the vector to avoid reference issues
            this.player.position.x = playerSpawnPosition.x;
            this.player.position.y = playerSpawnPosition.y;
            this.player.canvasPosition.x = playerSpawnPosition.x * Tile.SIZE;
            this.player.canvasPosition.y = playerSpawnPosition.y * Tile.SIZE;
        }
    }

    get collisionLayer() {
        return this.currentRoom?.collisionLayer;
    }

    update(dt) {
        this.player.update(dt);
        this.currentRoom.update(dt, this.player, this);

        // Update transition cooldown
        if (this.transitionCooldown > 0) {
            this.transitionCooldown -= dt;
        }

        // Check for room transitions (only if cooldown expired)
        if (this.transitionCooldown <= 0) {
            const activeTransition =
                this.currentRoom.roomTransition.checkTransitions(
                    this.player.position
                );

            if (activeTransition) {
                this.transitionToRoom(
                    activeTransition.targetRoom,
                    activeTransition.spawnPosition
                );
                this.transitionCooldown = this.transitionCooldownTime;
            }
        }

        this.currentRoom.onItemCollected = (item) => {
            this.moneyCollected += item.value;
        };
    }

    render() {
        if (!this.currentRoom || !this.player) return;

        // 1. Render floor layers
        this.currentRoom.floorLayer.render();
        this.currentRoom.wallCollisionLayer.render();
        this.currentRoom.objectCollisionLayer.render();

        // 2. Render vision cones (BEFORE walk-under layer)
        if (this.currentRoom.guards && this.currentRoom.guards.length > 0) {
            this.currentRoom.guards.forEach((guard) => {
                if (guard.visionCone) {
                    guard.visionCone.render();
                }
            });
        }

        // 3. Render interaction prompt
        this.currentRoom.interactableManager.renderPrompt();

        // 4. Render guards (sprites only)
        if (this.currentRoom.guards && this.currentRoom.guards.length > 0) {
            this.currentRoom.guards.forEach((guard) => {
                const x = Math.floor(guard.canvasPosition.x);
                const y = Math.floor(
                    guard.canvasPosition.y - guard.dimensions.y / 2
                );
                guard.sprites[guard.currentFrame].render(x, y);
            });
        }

        // 5. Render player
        this.player.render();

        // 6. Render layers that appear OVER vision cones, guards, and player
        if (this.currentRoom.walkUnderLayer) {
            this.currentRoom.walkUnderLayer.render();
        }

        if (this.currentRoom.topmostLayer) {
            this.currentRoom.topmostLayer.render();
        }
    }

    /**
     * Transition to a new room
     */
    transitionToRoom(roomName, spawnPosition) {
        // Handle special room names
        if (roomName === "exit") {
            this.onPlayerExit();
            return;
        }

        this.setCurrentRoom(roomName, spawnPosition);
    }

    onPlayerExit() {
        if (this.moneyCollected >= this.quota) {
            this.playerReachedExit = true;
        }
    }
}
