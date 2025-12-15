/**
 * Stealth Heist
 *
 * ASSET CREDITS:
 *
 * SPRITES:
 * - Characters and Maps: Modern Interiors by LimeZu (https://limezu.itch.io/moderninteriors)
 *
 * SOUNDS:
 * - Footsteps, Whoosh, Navigate, Select, Exit: 400 Sounds Pack by Chequered Ink (https://ci.itch.io/400-sounds-pack)
 * - Money Pickup (Cha-Ching): https://www.youtube.com/watch?v=tqNP8SiB90s
 * - Alert: https://www.youtube.com/watch?v=_8lkmC0jGug
 * - Game Over: https://www.youtube.com/watch?v=nPGvhgOMu9g
 * - Pause: https://www.youtube.com/watch?v=C30KnGCiD80
 * - Victory: https://www.youtube.com/watch?v=VJ8FQSh-H4U
 * - Clock Tick: https://www.youtube.com/watch?v=GMUhTsAsOTI
 * - Main Menu Music: https://www.youtube.com/watch?v=JiAlZIW7hsQ
 * - In-Game Music: https://www.youtube.com/watch?v=70ASH5TPwzo
 */

import GameStateName from "./enums/GameStateName.js";
import Game from "../lib/Game.js";
import {
    canvas,
    context,
    fonts,
    images,
    timer,
    sounds,
    stateMachine,
} from "./globals.js";
import PlayState from "./states/game/PlayState.js";
import GameOverState from "./states/game/GameOverState.js";
import VictoryState from "./states/game/VictoryState.js";
import TitleScreenState from "./states/game/TitleScreenState.js";
import InstructionsState from "./states/game/InstructionsState.js";
import TransitionState from "./states/game/TransitionState.js";

canvas.setAttribute("tabindex", "1");
document.body.appendChild(canvas);

// Fetch the asset definitions from assets.json.
const {
    images: imageDefinitions,
    fonts: fontDefinitions,
    sounds: soundDefinitions,
} = await fetch("./config/assets.json").then((response) => response.json());

// Load all the assets from their definitions.
images.load(imageDefinitions);
fonts.load(fontDefinitions);
sounds.load(soundDefinitions);

// Add all the states to the state machine.
stateMachine.add(GameStateName.TitleScreen, new TitleScreenState());
stateMachine.add(GameStateName.Instructions, new InstructionsState());
stateMachine.add(GameStateName.GameOver, new GameOverState());
stateMachine.add(GameStateName.Victory, new VictoryState());
stateMachine.add(GameStateName.Play, new PlayState());
stateMachine.add(GameStateName.Transition, new TransitionState()); // Add transition state

// Start at title screen
stateMachine.change(GameStateName.TitleScreen);

const game = new Game(
    stateMachine,
    context,
    timer,
    canvas.width,
    canvas.height
);

game.start();

canvas.focus();
