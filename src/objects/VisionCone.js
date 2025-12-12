import Vector from "../../lib/Vector.js";
import Tile from "../services/Tile.js";
import { context } from "../globals.js";

export default class VisionCone {
    constructor(position, direction, range, angle, smoothRotation = true) {
        this.position = position;
        this.direction = direction;
        this.baseRange = range * Tile.SIZE * 0.95; // Store base range
        this.range = this.baseRange; // Current range (can change)
        this.angle = angle;
        this.vertices = [];
        this.currentRotation = 0;
        this.targetRotation = 0;
        this.smoothRotation = smoothRotation;
        this.rotationSpeed = 180;

        this.update(position, direction);
    }

    /**
     * Set the detection multiplier (affects visual range)
     * @param {number} multiplier - 1.0 for normal, 0.6 for crouching
     */
    setDetectionMultiplier(multiplier) {
        this.range = this.baseRange * multiplier;
    }

    update(position, direction, dt = 0) {
        this.position = position;
        this.direction = direction;

        if (this.smoothRotation && dt > 0) {
            const rotationDiff = this.targetRotation - this.currentRotation;
            if (Math.abs(rotationDiff) > 0.1) {
                const rotationStep = this.rotationSpeed * dt;
                if (rotationDiff > 0) {
                    this.currentRotation += Math.min(
                        rotationStep,
                        rotationDiff
                    );
                } else {
                    this.currentRotation += Math.max(
                        -rotationStep,
                        rotationDiff
                    );
                }
            } else {
                this.currentRotation = this.targetRotation;
            }
        } else {
            this.currentRotation = this.targetRotation;
        }

        this.calculateVertices();
    }

    setTargetRotation(direction) {
        const directionToDegrees = {
            0: -90,
            1: 90,
            2: 180,
            3: 0,
        };

        this.targetRotation = directionToDegrees[direction];

        const diff = this.targetRotation - this.currentRotation;
        if (diff > 180) {
            this.currentRotation += 360;
        } else if (diff < -180) {
            this.currentRotation -= 360;
        }

        if (!this.smoothRotation) {
            this.currentRotation = this.targetRotation;
        }
    }

    calculateVertices() {
        const centerX = this.position.x * Tile.SIZE + Tile.SIZE / 2;
        const centerY = this.position.y * Tile.SIZE + Tile.SIZE / 2;

        const baseAngle = (this.currentRotation * Math.PI) / 180;
        const halfAngle = (this.angle * Math.PI) / 180 / 2;

        this.vertices = [{ x: centerX, y: centerY }];

        const arcSegments = 20;
        for (let i = 0; i <= arcSegments; i++) {
            const segmentAngle =
                baseAngle - halfAngle + (halfAngle * 2 * i) / arcSegments;
            this.vertices.push({
                x: centerX + Math.cos(segmentAngle) * this.range, // Uses current range
                y: centerY + Math.sin(segmentAngle) * this.range,
            });
        }
    }

    containsPoint(x, y, multiplier = 1.0) {
        // Use baseRange with multiplier for detection
        const effectiveRange = this.baseRange * multiplier;
        const centerX = this.position.x * Tile.SIZE + Tile.SIZE / 2;
        const centerY = this.position.y * Tile.SIZE + Tile.SIZE / 2;

        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > effectiveRange) {
            return false;
        }

        const pointAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const baseAngle = this.currentRotation;
        const halfAngle = this.angle / 2;

        let angleDiff = pointAngle - baseAngle;
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;

        return Math.abs(angleDiff) <= halfAngle;
    }

    render() {
        if (this.vertices.length < 3) return;

        context.save();

        context.fillStyle = "rgba(255, 0, 0, 0.3)";
        context.beginPath();
        context.moveTo(this.vertices[0].x, this.vertices[0].y);

        for (let i = 1; i < this.vertices.length; i++) {
            context.lineTo(this.vertices[i].x, this.vertices[i].y);
        }

        context.closePath();
        context.fill();

        context.strokeStyle = "rgba(255, 0, 0, 0.6)";
        context.lineWidth = 2;
        context.stroke();

        context.restore();
    }
}
