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
        this.currentRoomName = null;
        this.player = null;
        this.moneyCollected = 0;
        this.quota = Level.QUOTA;
        this.tilesetManager = new TilesetManager();

        this.transitionCooldown = 0;
        this.transitionCooldownTime = 0.5;

        this.playerReachedExit = false;
        this.onPlayerCaught = null;

        // Track collected items by unique ID (room_name:item_index)
        this.collectedItems = new Set();
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
        this.currentRoomName = roomName;

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
            this.player.position.x = playerSpawnPosition.x;
            this.player.position.y = playerSpawnPosition.y;
            this.player.canvasPosition.x = playerSpawnPosition.x * Tile.SIZE;
            this.player.canvasPosition.y = playerSpawnPosition.y * Tile.SIZE;
        }

        // Apply collected items state to the new room
        this.applyCollectedItemsToRoom();

        // Set up the item collection callback for this room
        this.setupItemCollectionCallback();
    }

    /**
     * Mark items as collected in the current room based on saved state
     */
    applyCollectedItemsToRoom() {
        if (!this.currentRoom || !this.currentRoom.interactableManager) {
            return;
        }

        const interactables =
            this.currentRoom.interactableManager.interactables;

        interactables.forEach((item, index) => {
            const itemId = `${this.currentRoomName}:${index}`;
            if (this.collectedItems.has(itemId)) {
                // IMPORTANT: Mark item as collected FIRST
                item.isCollected = true;

                // Then clear the tiles visually
                this.currentRoom.interactableManager.clearRegion(
                    item.x,
                    item.y,
                    item.width,
                    item.height
                );
            }
        });

        console.log(
            `Applied ${this.collectedItems.size} collected items to room ${this.currentRoomName}`
        );
    }

    /**
     * Set up the item collection callback for the current room
     * Called once when entering a room
     */
    setupItemCollectionCallback() {
        this.currentRoom.onItemCollected = (item) => {
            console.log("onItemCollected triggered:", item);

            // Get the index directly from the item (passed by InteractableManager)
            const itemIndex = item.index;
            const itemId = `${this.currentRoomName}:${itemIndex}`;

            console.log(
                `Attempting to collect item at index ${itemIndex} (${itemId})`
            );

            if (this.collectedItems.has(itemId)) {
                console.warn(`Item ${itemId} was already collected! Skipping.`);
                return;
            }

            this.moneyCollected += item.value;

            // Mark item as collected in our persistent state
            if (itemIndex !== -1 && itemIndex !== undefined) {
                this.markItemCollected(itemIndex);
                console.log(
                    `Successfully collected item ${itemId} for $${item.value}`
                );
            } else {
                console.error("Invalid item index!", itemIndex);
            }
        };
    }

    /**
     * Mark an item as collected
     * @param {number} itemIndex - Index of the item in the current room
     */
    markItemCollected(itemIndex) {
        const itemId = `${this.currentRoomName}:${itemIndex}`;
        this.collectedItems.add(itemId);
        console.log(
            `Marked item as collected: ${itemId}. Total collected: ${this.collectedItems.size}`
        );
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

    /**
     * Get the current game state for saving
     */
    getSaveState() {
        const collectedItemsArray = Array.from(this.collectedItems);

        console.log("Saving game state:", {
            room: this.currentRoomName,
            money: this.moneyCollected,
            itemsCollected: collectedItemsArray.length,
            items: collectedItemsArray,
        });

        return {
            currentRoom: this.currentRoomName,
            playerPosition: {
                x: this.player.position.x,
                y: this.player.position.y,
            },
            moneyCollected: this.moneyCollected,
            collectedItems: collectedItemsArray,
        };
    }

    /**
     * Restore game state from save data
     */
    restoreSaveState(saveData) {
        // Restore money
        this.moneyCollected = saveData.moneyCollected || 0;

        // Restore collected items
        this.collectedItems = new Set(saveData.collectedItems || []);

        console.log("Restored save state:", {
            room: saveData.currentRoom,
            money: this.moneyCollected,
            itemsCollected: this.collectedItems.size,
            items: Array.from(this.collectedItems),
        });

        // Set the current room with player position
        const playerPos = new Vector(
            saveData.playerPosition.x,
            saveData.playerPosition.y
        );

        this.setCurrentRoom(saveData.currentRoom, playerPos);
    }
}
