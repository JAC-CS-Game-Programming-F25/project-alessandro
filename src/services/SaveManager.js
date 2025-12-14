/**
 * Manages saving and loading game state to/from localStorage
 */
export default class SaveManager {
    static SAVE_KEY = "stealth-heist-save";

    /**
     * Save the complete game state to localStorage
     * @param {object} gameState - The state to save
     */
    static save(gameState) {
        try {
            const saveData = {
                version: 1, // For future save format changes
                timestamp: Date.now(),
                currentRoom: gameState.currentRoom,
                playerPosition: {
                    x: gameState.playerPosition.x,
                    y: gameState.playerPosition.y,
                },
                moneyCollected: gameState.moneyCollected,
                timeRemaining: gameState.timeRemaining,
                timePlayed: gameState.timePlayed,
                collectedItems: gameState.collectedItems || [],
            };

            localStorage.setItem(
                SaveManager.SAVE_KEY,
                JSON.stringify(saveData)
            );

            console.log("Game saved successfully");
            return true;
        } catch (error) {
            console.error("Failed to save game:", error);
            return false;
        }
    }

    /**
     * Load game state from localStorage
     * @returns {object|null} The saved game state or null if no save exists
     */
    static load() {
        try {
            const saveDataString = localStorage.getItem(SaveManager.SAVE_KEY);

            if (!saveDataString) {
                return null;
            }

            const saveData = JSON.parse(saveDataString);

            // Validate save data
            if (!saveData.currentRoom || !saveData.playerPosition) {
                console.warn("Invalid save data, ignoring");
                return null;
            }

            console.log("Game loaded successfully");
            return saveData;
        } catch (error) {
            console.error("Failed to load game:", error);
            return null;
        }
    }

    /**
     * Check if a save file exists
     * @returns {boolean}
     */
    static hasSaveData() {
        try {
            const saveData = localStorage.getItem(SaveManager.SAVE_KEY);
            return saveData !== null && saveData !== undefined;
        } catch (error) {
            return false;
        }
    }

    /**
     * Delete the save file
     */
    static deleteSave() {
        try {
            localStorage.removeItem(SaveManager.SAVE_KEY);
            console.log("Save deleted");
            return true;
        } catch (error) {
            console.error("Failed to delete save:", error);
            return false;
        }
    }

    /**
     * Get formatted save info for display
     * @returns {object|null}
     */
    static getSaveInfo() {
        const saveData = SaveManager.load();

        if (!saveData) {
            return null;
        }

        const date = new Date(saveData.timestamp);
        const timeString = date.toLocaleTimeString();
        const dateString = date.toLocaleDateString();

        const minutes = Math.floor(saveData.timeRemaining / 60);
        const seconds = Math.floor(saveData.timeRemaining % 60);

        return {
            room: saveData.currentRoom,
            money: saveData.moneyCollected,
            timeRemaining: `${minutes}:${seconds.toString().padStart(2, "0")}`,
            savedAt: `${dateString} ${timeString}`,
        };
    }
}
