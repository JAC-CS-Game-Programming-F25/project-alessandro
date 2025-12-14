import Player from "../entities/Player.js";
import Vector from "../../lib/Vector.js";
import Room from "./Room.js";
import TilesetManager from "./TilesetManager.js";
import { setCanvasSize } from "../globals.js";
import Tile from "./Tile.js";

export default class Level {
    constructor() {
        this.rooms = new Map();
        this.currentRoom = null;
        this.player = null;
        this.moneyCollected = 0;
        this.quota = 10000;
        this.tilesetManager = new TilesetManager();

        // Transition cooldown to prevent infinite loops
        this.transitionCooldown = 0;
        this.transitionCooldownTime = 0.5; // Half second cooldown
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

        if (!this.currentRoom) {
            console.error(`Room ${roomName} not loaded!`);
            return;
        }

        // Resize canvas to match room dimensions
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

        console.log(
            `Switched to room: ${roomName} (${this.currentRoom.pixelWidth}x${this.currentRoom.pixelHeight})`
        );
    }

    get collisionLayer() {
        return this.currentRoom?.collisionLayer;
    }

    update(dt) {
        if (!this.currentRoom || !this.player) {
            console.log("Level.update: No room or player");
            return;
        }

        this.player.update(dt);
        this.currentRoom.update(dt, this.player, this);

        // Update transition cooldown
        if (this.transitionCooldown > 0) {
            this.transitionCooldown -= dt;
        }

        // Check for room transitions (only if cooldown expired)
        if (this.transitionCooldown <= 0) {
            if (!this.currentRoom.roomTransition) {
                console.error("Current room has no roomTransition!");
                return;
            }
            const activeTransition =
                this.currentRoom.roomTransition.checkTransitions(
                    this.player.position
                );

            if (activeTransition) {
                console.log(
                    "TRANSITION TRIGGERED:",
                    activeTransition.targetRoom,
                    "from position:",
                    this.player.position
                );
                this.transitionToRoom(
                    activeTransition.targetRoom,
                    activeTransition.spawnPosition
                );
                this.transitionCooldown = this.transitionCooldownTime;
            }
        }

        this.currentRoom.onItemCollected = (item) => {
            this.moneyCollected += item.value;
            console.log(
                `Collected ${item.type} worth $${item.value}. Total: $${this.moneyCollected}`
            );
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

        // Check if room is already loaded
        if (!this.rooms.has(roomName)) {
            console.error(
                `Cannot transition to ${roomName} - room not loaded!`
            );
            return;
        }

        this.setCurrentRoom(roomName, spawnPosition);
    }

    onPlayerExit() {
        console.log("Player reached the exit!");

        // Check if quota is met
        if (this.moneyCollected >= this.quota) {
            console.log("🎉 VICTORY! You collected enough money!");
            console.log(`Final haul: $${this.moneyCollected} / $${this.quota}`);
            // TODO: Transition to VictoryState
        } else {
            const remaining = this.quota - this.moneyCollected;
            console.log(
                `❌ Not enough money! You need $${remaining} more to escape!`
            );
            console.log(`Current: $${this.moneyCollected} / $${this.quota}`);
            // Player can go back and collect more
        }
    }
}
