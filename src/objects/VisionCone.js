import Tile from "../services/Tile.js";
import { context } from "../globals.js";

export default class VisionCone {
    constructor(position, direction, range, angle, smoothRotation = true) {
        this.position = position;
        this.direction = direction;

        const numericRange = Number.parseFloat(range);
        const finalRange =
            !Number.isNaN(numericRange) && numericRange > 0 ? numericRange : 5;

        this.baseRange = finalRange * Tile.SIZE * 0.95; // Store base range
        this.range = this.baseRange; // Current range (modified by multiplier)
        this.detectionMultiplier = 1.0; // Default multiplier

        this.angle = angle;
        this.vertices = [];
        this.smoothRotation = smoothRotation;
        this.rotationSpeed = 180;

        const directionToDegrees = {
            0: -90,
            1: 90,
            2: 180,
            3: 0,
        };

        this.currentRotation = directionToDegrees[direction];
        this.targetRotation = this.currentRotation;

        this.update(position, direction);
    }

    /**
     * Set the detection multiplier (affects visual range)
     * @param {number} multiplier - 1.0 for normal, 0.6 for crouching
     */
    setDetectionMultiplier(multiplier) {
        this.detectionMultiplier = multiplier;
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
                x: centerX + Math.cos(segmentAngle) * this.range,
                y: centerY + Math.sin(segmentAngle) * this.range,
            });
        }
    }

    /**
     * Check if a point is inside the vision cone AND has line of sight
     * NOTE: multiplier parameter is NO LONGER USED - we use this.detectionMultiplier instead
     * @param {number} x - Point X in pixels
     * @param {number} y - Point Y in pixels
     * @param {number} multiplier - DEPRECATED - kept for backwards compatibility
     * @param {Layer} collisionLayer - Collision layer to check walls
     * @returns {boolean}
     */
    containsPoint(x, y, multiplier = 1.0, collisionLayer = null) {
        // Use the ALREADY-MODIFIED range (no need to apply multiplier again)
        const effectiveRange = this.range;

        const centerX = this.position.x * Tile.SIZE + Tile.SIZE / 2;
        const centerY = this.position.y * Tile.SIZE + Tile.SIZE / 2;

        // Check distance
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.hypot(dx, dy);

        if (distance > effectiveRange) {
            return false;
        }

        // Check angle
        const pointAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const baseAngle = this.currentRotation;
        const halfAngle = this.angle / 2;

        let angleDiff = pointAngle - baseAngle;
        while (angleDiff > 180) angleDiff -= 360;
        while (angleDiff < -180) angleDiff += 360;

        if (Math.abs(angleDiff) > halfAngle) {
            return false;
        }

        // Check line of sight (raycast from guard to player)
        if (collisionLayer) {
            if (!this.hasLineOfSight(centerX, centerY, x, y, collisionLayer)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Raycast from guard to target to check for walls
     * @param {number} x1 - Start X (guard position)
     * @param {number} y1 - Start Y (guard position)
     * @param {number} x2 - End X (player position)
     * @param {number} y2 - End Y (player position)
     * @param {Layer} collisionLayer
     * @returns {boolean} True if line of sight is clear
     */
    hasLineOfSight(x1, y1, x2, y2, collisionLayer) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Number of steps to check along the line
        const steps = Math.ceil(distance / (Tile.SIZE / 2)); // Check every half-tile

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const checkX = x1 + dx * t;
            const checkY = y1 + dy * t;

            // Convert to grid coordinates
            const gridX = Math.floor(checkX / Tile.SIZE);
            const gridY = Math.floor(checkY / Tile.SIZE);

            // Check if there's a wall at this position
            const tile = collisionLayer.getTile(gridX, gridY);
            if (tile !== null && tile.id !== 0) {
                return false; // Wall blocks line of sight
            }
        }

        return true; // Clear line of sight
    }

    render() {
        context.save();
        context.globalAlpha = 0.3;
        context.fillStyle = "red";
        context.strokeStyle = "darkred";
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo(this.vertices[0].x, this.vertices[0].y);

        for (let i = 1; i < this.vertices.length; i++) {
            context.lineTo(this.vertices[i].x, this.vertices[i].y);
        }

        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    }
}
