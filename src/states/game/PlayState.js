import State from "../../../lib/State.js";
import Level from "../../services/Level.js";
import RoomName from "../../enums/RoomName.js";
import Vector from "../../../lib/Vector.js";
import HUD from "../../objects/HUD.js";
import GameStateName from "../../enums/GameStateName.js";
import { input, context, canvas, stateMachine } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayState extends State {
    constructor() {
        super();
        this.level = new Level();
        this.hud = null;
        this.isLoaded = false;
        this.isPaused = false;
        this.timeRemaining = 600; // 10 minutes in seconds
        this.timePlayed = 0;
    }

    async enter() {
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

        // Start in the entrance
        this.level.setCurrentRoom(RoomName.MuseumEntrance, new Vector(14, 16));

        // Store timer in level for HUD access
        this.level.timeRemaining = this.timeRemaining;

        // Set the caught handler
        this.level.onPlayerCaught = () => {
            this.onGameOver("caught");
        };

        // Initialize HUD after canvas is resized
        this.hud = new HUD(this.level);

        this.isLoaded = true;
    }

    update(dt) {
        if (!this.isLoaded) {
            return;
        }

        // Handle pause
        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            this.isPaused = !this.isPaused;
        }

        if (this.isPaused) {
            return;
        }

        // Update timer
        this.timeRemaining -= dt;
        this.timePlayed += dt;
        this.level.timeRemaining = this.timeRemaining;

        // Check for time out
        if (this.timeRemaining <= 0) {
            this.onGameOver("timeout");
            return;
        }

        this.level.update(dt);

        // Check for victory
        if (this.level.playerReachedExit) {
            this.onVictory();
        }
    }

    render() {
        if (!this.isLoaded) {
            return;
        }

        this.level.render();
        this.hud.render();

        if (this.isPaused) {
            this.renderPauseOverlay();
        }
    }

    renderPauseOverlay() {
        const width = canvas.width;
        const height = canvas.height;

        context.save();

        context.fillStyle = "rgba(0, 0, 0, 0.8)";
        context.fillRect(0, 0, width, height);

        const centerY = height / 2;

        context.shadowBlur = 25;
        context.shadowColor = "#4CAF50";
        context.fillStyle = "#4CAF50";
        context.font = "bold 60px Arial";
        context.textAlign = "center";
        context.fillText("PAUSED", width / 2, centerY - 60);
        context.shadowBlur = 0;

        const btnWidth = 300;
        const btnHeight = 60;
        const btnX = width / 2 - btnWidth / 2;
        const btnY = centerY + 10;

        const btnGrad = context.createLinearGradient(
            btnX,
            btnY,
            btnX,
            btnY + btnHeight
        );
        btnGrad.addColorStop(0, "rgba(30, 30, 30, 1)");
        btnGrad.addColorStop(1, "rgba(20, 20, 20, 1)");
        context.fillStyle = btnGrad;
        context.fillRect(btnX, btnY, btnWidth, btnHeight);

        context.strokeStyle = "#4CAF50";
        context.lineWidth = 3;
        context.strokeRect(btnX, btnY, btnWidth, btnHeight);

        context.fillStyle = "#2a2a2a";
        context.fillRect(btnX + 15, btnY + 17, 35, 26);
        context.strokeStyle = "#4CAF50";
        context.lineWidth = 2;
        context.strokeRect(btnX + 15, btnY + 17, 35, 26);

        context.fillStyle = "#4CAF50";
        context.font = "bold 16px Arial";
        context.textAlign = "center";
        context.fillText("ESC", btnX + 32.5, btnY + 36);

        context.font = "bold 24px Arial";
        context.textAlign = "left";
        context.fillText("Resume Game", btnX + 65, btnY + 38);

        const bracketSize = 25;
        const margin = width / 2 - 200;
        const topY = centerY - 120;
        const bottomY = centerY + 120;

        context.strokeStyle = "#4CAF50";
        context.lineWidth = 2;

        // Corner brackets
        context.beginPath();
        context.moveTo(margin, topY + bracketSize);
        context.lineTo(margin, topY);
        context.lineTo(margin + bracketSize, topY);
        context.stroke();

        context.beginPath();
        context.moveTo(width - margin, topY + bracketSize);
        context.lineTo(width - margin, topY);
        context.lineTo(width - margin - bracketSize, topY);
        context.stroke();

        context.beginPath();
        context.moveTo(margin, bottomY - bracketSize);
        context.lineTo(margin, bottomY);
        context.lineTo(margin + bracketSize, bottomY);
        context.stroke();

        context.beginPath();
        context.moveTo(width - margin, bottomY - bracketSize);
        context.lineTo(width - margin, bottomY);
        context.lineTo(width - margin - bracketSize, bottomY);
        context.stroke();

        context.fillStyle = "#666";
        context.font = "16px Arial";
        context.textAlign = "center";
        context.fillText(
            "Game progress is auto-saved",
            width / 2,
            bottomY + 50
        );

        context.restore();
    }

    onGameOver(reason) {
        // Use transition to game over
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
        // Use transition to victory
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
