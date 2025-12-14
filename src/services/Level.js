import Player from "../entities/Player.js";
import Vector from "../../lib/Vector.js";
import Room from "./Room.js";
import TilesetManager from "./TilesetManager.js";
import { timer, setCanvasSize } from "../globals.js";
import Tile from "./Tile.js";
import MessageDisplay from "../objects/MessageDisplay.js";
import ParticleSystem from "./ParticleSystem.js";
import ExitPortal from "../objects/ExitPortal.js";
import Easing from "../../lib/Easing.js";

export default class Level {
    static QUOTA = 500;

    constructor() {
        this.rooms = new Map();
        this.currentRoom = null;
        this.currentRoomName = null;
        this.player = null;
        this.moneyCollected = 0;
        this.displayedMoney = 0;
        this.quota = Level.QUOTA;
        this.tilesetManager = new TilesetManager();

        this.transitionCooldown = 0;
        this.transitionCooldownTime = 0.5;

        this.playerReachedExit = false;
        this.onPlayerCaught = null;

        this.messageDisplay = new MessageDisplay();

        this.particleSystem = new ParticleSystem();
        this.exitPortal = null;

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

        // Find the exit transition and create portal
        this.exitPortal = null;
        const exitTransition = this.currentRoom.roomTransition.transitions.find(
            (t) => t.targetRoom === "exit"
        );

        if (exitTransition) {
            this.exitPortal = new ExitPortal(
                exitTransition.x,
                exitTransition.y,
                exitTransition.width,
                exitTransition.height
            );
        }

        this.applyCollectedItemsToRoom();
        this.setupItemCollectionCallback();
    }

    /**
     * Mark items as collected in the current room based on saved state
     */
    applyCollectedItemsToRoom() {
        if (!this.currentRoom?.interactableManager) {
            return;
        }

        const interactables =
            this.currentRoom.interactableManager.interactables;

        interactables.forEach((item, index) => {
            const itemId = `${this.currentRoomName}:${index}`;
            if (this.collectedItems.has(itemId)) {
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
    }

    /**
     * Set up the item collection callback for the current room
     * Called once when entering a room
     */
    setupItemCollectionCallback() {
        // Store a reference to level for use in the continuous update
        if (!this.moneyTweenObject) {
            this.moneyTweenObject = { value: 0 };
        }

        this.currentRoom.onItemCollected = (item) => {
            const interactables =
                this.currentRoom.interactableManager.interactables;
            const itemData = interactables[item.index];

            const itemX = itemData.pixelX + itemData.pixelWidth / 2;
            const itemY = itemData.pixelY + itemData.pixelHeight / 2;
            this.particleSystem.burst(itemX, itemY, "#FFD700", 20);

            this.moneyCollected += item.value;

            // Tween the moneyTweenObject
            timer.tween(
                this.moneyTweenObject,
                { value: this.moneyCollected },
                0.5,
                Easing.linear
            );

            const itemIndex = item.index;
            if (itemIndex !== -1 && itemIndex !== undefined) {
                this.markItemCollected(itemIndex);
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
    }

    get collisionLayer() {
        return this.currentRoom?.collisionLayer;
    }

    update(dt) {
        this.player.update(dt);
        this.currentRoom.update(dt, this.player, this);
        this.particleSystem.update(dt);

        if (this.moneyTweenObject) {
            this.displayedMoney = this.moneyTweenObject.value;
        }

        this.messageDisplay.update(dt);

        if (this.exitPortal) {
            this.exitPortal.update(dt, this.moneyCollected >= this.quota);
        }

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
        // 1. Render floor layers
        this.currentRoom.floorLayer.render();
        this.currentRoom.wallCollisionLayer.render();
        this.currentRoom.objectCollisionLayer.render();

        // 2. Render vision cones
        if (this.currentRoom.guards && this.currentRoom.guards.length > 0) {
            this.currentRoom.guards.forEach((guard) => {
                if (guard.visionCone) {
                    guard.visionCone.render();
                }
            });
        }

        // 3. Render guards (sprites only)
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

        // 5. Render walk-under and topmost layers
        if (this.currentRoom.walkUnderLayer) {
            this.currentRoom.walkUnderLayer.render();
        }

        if (this.currentRoom.topmostLayer) {
            this.currentRoom.topmostLayer.render();
        }

        // 6. Render exit portal
        if (this.exitPortal) {
            this.exitPortal.render();
        }

        // 7. Render particles on top
        this.particleSystem.render();

        // 8. Render interaction prompt last
        this.currentRoom.interactableManager.renderPrompt();

        this.messageDisplay.render();
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
        const amountNeeded = this.quota - this.moneyCollected;

        if (amountNeeded > 0) {
            // Not enough money - show warning and teleport back
            this.messageDisplay.showMessage(
                `Need $${amountNeeded} more to escape!`,
                3,
                "#f44336"
            );

            // Teleport player back to spawn point
            this.player.position.x = 14;
            this.player.position.y = 16;
            this.player.canvasPosition.x = 14 * Tile.SIZE;
            this.player.canvasPosition.y = 16 * Tile.SIZE;

            console.log("Player tried to exit without enough money!");
        } else {
            // Has enough money - allow exit
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
        this.displayedMoney = saveData.moneyCollected || 0;

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
