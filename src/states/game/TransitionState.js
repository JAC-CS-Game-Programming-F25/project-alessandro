import State from "../../../lib/State.js";
import Easing from "../../../lib/Easing.js";
import { canvas, context, timer, stateMachine } from "../../globals.js";

/**
 * An "intermediary" state that handles smooth fade transitions
 * between different game states (title screen, play, game over, etc.)
 */
export default class TransitionState extends State {
    constructor() {
        super();
        this.transitionParameters = { alpha: 0 };
        this.currentState = null;
        this.transitionDuration = 0.5; // Faster transitions (0.5 seconds)
    }

    /**
     * @param {object} parameters
     * @param {State} parameters.fromState - State we're transitioning from
     * @param {State} parameters.toState - State we're transitioning to
     * @param {object} parameters.toStateEnterParameters - Parameters to pass to the new state
     */
    enter(parameters) {
        this.fromState = parameters.fromState;
        this.toState = parameters.toState;
        this.toStateEnterParameters = parameters.toStateEnterParameters || {};
        this.currentState = this.fromState;
        this.transitionParameters = { alpha: 0 };

        this.fadeOut();
    }

    update(dt) {
        // Keep the current state updated during transition
        // This allows animations to continue smoothly
        if (this.currentState) {
            this.currentState.update(dt);
        }
    }

    render() {
        // Render the current state underneath
        if (this.currentState) {
            this.currentState.render();
        }

        // Render the transition overlay on top
        context.save();
        context.fillStyle = `rgba(0, 0, 0, ${this.transitionParameters.alpha})`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();
    }

    /**
     * Fade to black, then switch states and fade in
     */
    async fadeOut() {
        // Tween alpha from 0 to 1 (fade to black)
        await timer.tweenAsync(
            this.transitionParameters,
            { alpha: 1 },
            this.transitionDuration,
            Easing.easeInQuad
        );

        // Switch to the new state
        this.currentState = this.toState;
        this.currentState.enter(this.toStateEnterParameters);

        // Fade back in
        this.fadeIn();
    }

    /**
     * Fade from black to clear, revealing the new state
     */
    async fadeIn() {
        // Tween alpha from 1 to 0 (fade from black)
        await timer.tweenAsync(
            this.transitionParameters,
            { alpha: 0 },
            this.transitionDuration,
            Easing.easeOutQuad
        );

        // Transition complete - set the state machine to the new state
        stateMachine.currentState = this.currentState;
    }
}
