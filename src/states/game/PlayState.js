import State from "../../../lib/State.js";
import Level from "../../services/Level.js";
import RoomName from "../../enums/RoomName.js";
import Vector from "../../../lib/Vector.js";
import HUD from "../../objects/HUD.js";
import GameStateName from "../../enums/GameStateName.js";
import SaveManager from "../../services/SaveManager.js";
import {
    input,
    context,
    canvas,
    stateMachine,
    TIME_TO_COMPLETE,
    sounds,
} from "../../globals.js";
import Input from "../../../lib/Input.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import SoundName from "../../enums/SoundName.js";

export default class PlayState extends State {
    constructor() {
        super();
        this.level = new Level();
        this.hud = null;
        this.isLoaded = false;
        this.isPaused = false;
        this.timeRemaining = TIME_TO_COMPLETE; // 10 minutes in seconds
        this.timePlayed = 0;
        this.isWarningPlaying = false;

        // Auto-save configuration
        this.autoSaveInterval = 2;
        this.timeSinceLastSave = 0;
    }

    async enter(params = {}) {
        this.isLoaded = false;

        // Reset pause state when entering PlayState
        this.isPaused = false;

        this.gameEnded = false;

        // Check if we're loading from a save
        const loadFromSave = params.loadFromSave || false;

        // Load all rooms
        await this.level.loadRoom(
            RoomName.MuseumEntrance,
            "../../config/museum-entrance.json"
        );

        await this.level.loadRoom(
            RoomName.MuseumRoom1,
            "../../config/museum-room-1.json"
        );

        await this.level.loadRoom(
            RoomName.MuseumRoom2,
            "../../config/museum-room-2.json"
        );

        await this.level.loadRoom(
            RoomName.MuseumRoom3,
            "../../config/museum-room-3.json"
        );

        await this.level.loadRoom(
            RoomName.MuseumRoom4,
            "../../config/museum-room-4.json"
        );

        if (loadFromSave) {
            // Load from save
            const saveData = SaveManager.load();
            if (saveData) {
                this.timeRemaining = saveData.timeRemaining;
                this.timePlayed = saveData.timePlayed || 0;
                this.level.restoreSaveState(saveData);
            } else {
                // Fallback to new game if save failed
                this.startNewGame();
            }
        } else {
            // Start fresh game
            this.startNewGame();
        }

        if (this.level.player) {
            this.level.player.changeState(PlayerStateName.Idling);
            this.level.player.velocity.x = 0;
            this.level.player.velocity.y = 0;
        }

        // Store timer in level for HUD access
        this.level.timeRemaining = this.timeRemaining;

        // Set the caught handler
        this.level.onPlayerCaught = () => {
            if (this.gameEnded) {
                return;
            }

            sounds.stop(SoundName.InGame);
            if (this.isWarningPlaying) {
                sounds.stop(SoundName.ClockTick);
                this.isWarningPlaying = false;
            }

            this.onGameOver("caught");
        };

        // Initialize HUD after canvas is resized
        this.hud = new HUD(this.level);

        this.isLoaded = true;
        this.timeSinceLastSave = 0;
        sounds.play(SoundName.InGame);
    }

    /**
     * Start a new game from the beginning
     */
    startNewGame() {
        this.timeRemaining = TIME_TO_COMPLETE;
        this.timePlayed = 0;

        this.level.moneyCollected = 0;
        this.level.displayedMoney = 0;
        this.level.collectedItems.clear();
        this.level.playerReachedExit = false;

        // Reset the money tween object if it exists
        if (this.level.moneyTweenObject) {
            this.level.moneyTweenObject.value = 0;
        }

        this.level.setCurrentRoom(RoomName.MuseumEntrance, new Vector(14, 16));

        // Delete old save when starting new game
        SaveManager.deleteSave();
    }

    update(dt) {
        if (!this.isLoaded || this.gameEnded) {
            return;
        }

        // Handle pause toggle
        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            this.isPaused = !this.isPaused;
            sounds.play(SoundName.Pause);

            // Pause/unpause gameplay sounds
            if (this.isPaused) {
                sounds.pause(SoundName.InGame);
                if (this.isWarningPlaying) {
                    sounds.pause(SoundName.ClockTick);
                }
            } else {
                sounds.play(SoundName.InGame); // Resume music
                if (this.isWarningPlaying) {
                    sounds.play(SoundName.ClockTick); // Resume ticking
                }
            }
        }

        // Handle pause menu actions
        if (this.isPaused) {
            if (input.isKeyPressed(Input.KEYS.Q)) {
                // Quit to menu
                this.autoSave();
                stateMachine.change(GameStateName.TitleScreen);
                return;
            }
            // Don't update game when paused
            return;
        }

        // Update timer
        this.timeRemaining -= dt;
        this.timePlayed += dt;
        this.level.timeRemaining = this.timeRemaining;

        if (this.timeRemaining < 60 && !this.isWarningPlaying) {
            sounds.play(SoundName.ClockTick);
            this.isWarningPlaying = true;
        } else if (this.timeRemaining >= 60 && this.isWarningPlaying) {
            sounds.stop(SoundName.ClockTick);
            this.isWarningPlaying = false;
        }

        // Auto-save logic
        this.timeSinceLastSave += dt;
        if (this.timeSinceLastSave >= this.autoSaveInterval) {
            this.autoSave();
            this.timeSinceLastSave = 0;
        }

        // Check for time out
        if (this.timeRemaining <= 0) {
            if (this.isWarningPlaying) {
                sounds.stop(SoundName.ClockTick);
                this.isWarningPlaying = false;
            }

            this.onGameOver("timeout");
            return;
        }

        this.level.update(dt);

        // Check for victory
        if (this.level.playerReachedExit) {
            this.onVictory();
        }
    }

    /**
     * Auto-save the game state
     */
    autoSave() {
        const gameState = this.level.getSaveState();
        gameState.timeRemaining = this.timeRemaining;
        gameState.timePlayed = this.timePlayed;

        SaveManager.save(gameState);
    }

    render() {
        if (!this.isLoaded) {
            return;
        }

        this.level.render();
        this.hud.render();

        // DEBUG: Show interaction ranges (set to true to enable)
        const DEBUG_INTERACTIONS = false;
        if (DEBUG_INTERACTIONS && this.level.currentRoom && this.level.player) {
            this.level.currentRoom.interactableManager.renderDebug(
                this.level.player.position
            );
        }

        if (this.isPaused) {
            this.renderPauseOverlay();
        }
    }

    exit() {
        sounds.stop(SoundName.InGame);
        if (this.isWarningPlaying) {
            sounds.stop(SoundName.ClockTick);
            this.isWarningPlaying = false;
        }

        // Save one last time when exiting play state
        if (this.isLoaded) {
            this.autoSave();
        }
    }

    renderPauseOverlay() {
        const width = canvas.width;
        const height = canvas.height;
        context.save();

        // Dark overlay
        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        context.fillRect(0, 0, width, height);

        const centerY = height / 2;

        // Title
        context.shadowBlur = 25;
        context.shadowColor = "#4CAF50";
        context.fillStyle = "#4CAF50";
        context.font = "bold 60px Orbitron";
        context.textAlign = "center";
        context.fillText("PAUSED", width / 2, centerY - 60);
        context.shadowBlur = 0;

        // ESC - Resume button
        const btn1Y = centerY - 20;
        this.renderPauseButton(
            "ESC",
            "Resume Game",
            width / 2 - 150,
            btn1Y,
            300,
            60,
            "#4CAF50"
        );

        // Q - Quit button
        const btn2Y = centerY + 55;
        this.renderPauseButton(
            "Q",
            "Quit to Menu",
            width / 2 - 150,
            btn2Y,
            300,
            60,
            "#f44336"
        );

        // Corner brackets
        const bracketSize = 25;
        const margin = width / 2 - 200;
        const topY = centerY - 120;
        const bottomY = centerY + 160;

        context.strokeStyle = "#4CAF50";
        context.lineWidth = 2;

        // Top left
        context.beginPath();
        context.moveTo(margin, topY + bracketSize);
        context.lineTo(margin, topY);
        context.lineTo(margin + bracketSize, topY);
        context.stroke();

        // Top right
        context.beginPath();
        context.moveTo(width - margin, topY + bracketSize);
        context.lineTo(width - margin, topY);
        context.lineTo(width - margin - bracketSize, topY);
        context.stroke();

        // Bottom left
        context.beginPath();
        context.moveTo(margin, bottomY - bracketSize);
        context.lineTo(margin, bottomY);
        context.lineTo(margin + bracketSize, bottomY);
        context.stroke();

        // Bottom right
        context.beginPath();
        context.moveTo(width - margin, bottomY - bracketSize);
        context.lineTo(width - margin, bottomY);
        context.lineTo(width - margin - bracketSize, bottomY);
        context.stroke();

        // Auto-save message
        context.fillStyle = "#666";
        context.font = "14px RobotoMono";
        context.textAlign = "center";
        context.fillText(
            `Game auto-saves every ${this.autoSaveInterval} seconds`,
            width / 2,
            bottomY + 40
        );

        context.restore();
    }

    renderPauseButton(key, label, x, y, btnWidth, btnHeight, color) {
        // Button gradient
        const btnGrad = context.createLinearGradient(x, y, x, y + btnHeight);
        btnGrad.addColorStop(0, "rgba(30, 30, 30, 1)");
        btnGrad.addColorStop(1, "rgba(20, 20, 20, 1)");
        context.fillStyle = btnGrad;
        context.fillRect(x, y, btnWidth, btnHeight);

        // Button border
        context.strokeStyle = color;
        context.lineWidth = 3;
        context.strokeRect(x, y, btnWidth, btnHeight);

        // Key box
        const keyBoxSize = 35;
        context.fillStyle = "#2a2a2a";
        context.fillRect(
            x + 15,
            y + (btnHeight - keyBoxSize) / 2,
            keyBoxSize,
            keyBoxSize
        );
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.strokeRect(
            x + 15,
            y + (btnHeight - keyBoxSize) / 2,
            keyBoxSize,
            keyBoxSize
        );

        // Key text
        context.fillStyle = color;
        context.font = "bold 16px RobotoMono";
        context.textAlign = "center";
        context.fillText(key, x + 15 + keyBoxSize / 2, y + btnHeight / 2 + 6);

        // Label text
        context.font = "bold 24px Orbitron";
        context.textAlign = "left";
        context.fillText(label, x + 65, y + btnHeight / 2 + 8);
    }

    onGameOver(reason) {
        if (this.gameEnded) {
            return;
        }

        this.gameEnded = true;

        sounds.stop(SoundName.InGame);
        if (this.isWarningPlaying) {
            sounds.stop(SoundName.ClockTick);
            this.isWarningPlaying = false;
        }

        SaveManager.deleteSave();

        stateMachine.change(GameStateName.Transition, {
            fromState: this,
            toState: stateMachine.states[GameStateName.GameOver],
            toStateEnterParameters: {
                reason: reason,
                moneyCollected: this.level.moneyCollected,
                quota: this.level.quota,
                timeLeft: this.timeRemaining,
            },
        });
    }

    onVictory() {
        if (this.isWarningPlaying) {
            sounds.stop(SoundName.ClockTick);
            this.isWarningPlaying = false;
        }

        // Delete save on victory
        SaveManager.deleteSave();

        stateMachine.change(GameStateName.Transition, {
            fromState: this,
            toState: stateMachine.states[GameStateName.Victory],
            toStateEnterParameters: {
                totalMoney: this.level.moneyCollected,
                totalTime: this.timePlayed,
            },
        });
    }
}
