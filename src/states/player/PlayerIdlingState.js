import Animation from "../../../lib/Animation.js";
import State from "../../../lib/State.js";
import Direction from "../../enums/Direction.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayerIdlingState extends State {
    static IDLE_ANIMATION_TIME = 0.2;

    constructor(player) {
        super();

        this.player = player;
        this.animation = {
            [Direction.Up]: new Animation(
                [6, 7, 8, 9, 10, 11],
                PlayerIdlingState.IDLE_ANIMATION_TIME
            ),
            [Direction.Down]: new Animation(
                [18, 19, 20, 21, 22, 23],
                PlayerIdlingState.IDLE_ANIMATION_TIME
            ),
            [Direction.Left]: new Animation(
                [12, 13, 14, 15, 16, 17],
                PlayerIdlingState.IDLE_ANIMATION_TIME
            ),
            [Direction.Right]: new Animation(
                [0, 1, 2, 3, 4, 5],
                PlayerIdlingState.IDLE_ANIMATION_TIME
            ),
        };
    }

    enter() {
        this.player.sprites = this.player.idleSprites;
        this.player.currentAnimation = this.animation[this.player.direction];
    }

    update() {
        // Check for interaction
        if (input.isKeyPressed(Input.KEYS.E)) {
            this.handleInteraction();
        }

        // Check for movement
        if (input.isKeyHeld(Input.KEYS.SHIFT)) {
            this.player.changeState(PlayerStateName.Crouching);
            return;
        }

        if (input.isKeyHeld(Input.KEYS.S)) {
            this.player.direction = Direction.Down;
            this.player.changeState(PlayerStateName.Walking);
        } else if (input.isKeyHeld(Input.KEYS.D)) {
            this.player.direction = Direction.Right;
            this.player.changeState(PlayerStateName.Walking);
        } else if (input.isKeyHeld(Input.KEYS.W)) {
            this.player.direction = Direction.Up;
            this.player.changeState(PlayerStateName.Walking);
        } else if (input.isKeyHeld(Input.KEYS.A)) {
            this.player.direction = Direction.Left;
            this.player.changeState(PlayerStateName.Walking);
        }
    }

    /**
     * Handle E key interaction with items
     */
    handleInteraction() {
        const room = this.player.level.currentRoom;

        if (room.interactableManager.canInteract()) {
            this.player.changeState(PlayerStateName.Stealing);

            const itemData = room.interactableManager.collect();

            if (itemData) {
                if (room.onItemCollected) {
                    room.onItemCollected(itemData);
                }
            }
        }
    }
}
