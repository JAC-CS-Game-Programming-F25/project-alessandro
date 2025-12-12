import State from "../../../lib/State.js";

export default class GuardAlertState extends State {
    /**
     * Guard has detected the player - trigger game over
     *
     * @param {Guard} guard
     */
    constructor(guard) {
        super();
        this.guard = guard;
    }

    enter() {
        console.log("CAUGHT! Guard detected player!");

        // Trigger game over
        // We'll implement this properly later with game states
        if (this.guard.level) {
            this.onPlayerCaught();
        }
    }

    onPlayerCaught() {
        // For now, just log it
        // Later we'll transition to GameOverState
        console.log("Player was caught by guard!");

        // You could add a delay here or freeze the game
        // For now we'll just log it so you can test
    }
}
