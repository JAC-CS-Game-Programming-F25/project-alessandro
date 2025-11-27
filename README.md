# Stealth Heist - Final Project

## ✒️ Description

**Stealth Heist** is a top-down stealth/puzzle game where players take on the role of a skilled thief attempting to pull off heists across three different high-security locations. Each level presents unique challenges as players navigate around guards and security systems to steal valuable items and escape before time runs out.

### Premise

You are a master thief known for pulling off impossible heists. Your reputation has earned you three major contracts: infiltrating a prestigious museum, robbing a high-security bank, and stealing from a luxurious mansion. Each location is heavily guarded with patrol guards, stationary sentries, and state-of-the-art security cameras. Your goal is to collect enough valuable items to meet your client's demands and escape without being detected.

### Genre

Top-down stealth/puzzle game with action elements.

## 🕹️ Gameplay

The game is played from a top-down perspective where the player must navigate through each level while avoiding detection. Players use stealth mechanics to avoid guard vision cones and camera surveillance zones while collecting valuable items scattered throughout the environment.

### Core Mechanics

**Movement & Stealth:**

-   Players move their character using WASD keys in four directions
-   Holding Shift enables crouching, which slows movement speed but reduces detection range
-   The player must stay outside of guard vision cones and camera detection zones

**Collection System:**

-   Each level contains various items (jewelry, cash, paintings, artifacts) with different monetary values
-   Players press E to pick up items when standing near them
-   Each level has a monetary quota that must be reached before the exit unlocks
-   Current money collected is displayed in the HUD

**Time Pressure:**

-   Each level has a countdown timer
-   Players must collect the quota and reach the exit before time expires
-   Timer is displayed prominently in the HUD

**Detection & Consequences:**

-   If the player enters a guard's vision cone or a camera's detection zone, they are instantly caught
-   Being caught results in immediate level restart
-   Running out of time also results in level restart
-   No lives system - players can retry unlimited times

**Victory Conditions:**

-   Collect items worth at least the level's monetary quota
-   Reach the exit door (which unlocks when quota is met)
-   Complete objective before the timer runs out
-   Beat all three levels to achieve final victory

### Controls

-   **WASD** - Move character (up, left, down, right)
-   **Shift** - Crouch (slower movement, reduced detection range)
-   **E** - Pick up items/interact
-   **ESC** - Pause game
-   **M** - Mute/unmute sounds (optional)

### Enemy Types

**Patrol Guards:**

-   Move along predetermined waypoint paths
-   Have forward-facing vision cones
-   Return to their patrol route after level restart

**Stationary Guards:**

-   Stand in fixed positions
-   Rotate their vision cone back and forth
-   Cover key chokepoints and valuable items

**Security Cameras:**

-   Fixed to walls or ceilings
-   Sweep their vision cone in an arc
-   Cover larger areas than individual guards

### Level Progression

**Level 1: Museum Heist**

-   Theme: Art museum with open galleries
-   Difficulty: Beginner-friendly
-   Layout: Open spaces with fewer guards
-   Quota: $500
-   Timer: 4:00
-   Features: Mostly patrol guards, 1-2 cameras

**Level 2: Bank Robbery**

-   Theme: Modern bank with vaults and offices
-   Difficulty: Medium
-   Layout: Tighter corridors and multiple rooms
-   Quota: $1000
-   Timer: 3:30
-   Features: Mix of patrol and stationary guards, more cameras

**Level 3: Mansion Infiltration**

-   Theme: Luxurious mansion with many rooms
-   Difficulty: Hard
-   Layout: Complex multi-room design with many paths
-   Quota: $1500
-   Timer: 3:00
-   Features: All guard types, many cameras, challenging layouts

## 📃 Requirements

The player shall be able to:

1. View a title screen with menu options upon starting the game
2. Navigate to an instructions screen to learn game controls and mechanics
3. Start a new game from the title screen
4. Move their character in four directions using WASD keys
5. Crouch by holding Shift to move slower with reduced detection range
6. Pick up items by pressing E when near them
7. See the current money collected displayed in the HUD
8. See the monetary quota needed displayed in the HUD
9. See the remaining time displayed in the HUD
10. Navigate through tile-based levels with walls and obstacles
11. Avoid detection from patrol guards that move along waypoint paths
12. Avoid detection from stationary guards that rotate their vision cones
13. Avoid detection from security cameras with sweeping detection zones
14. Collect items with varying monetary values ($50, $100, $150, $200)
15. Reach the monetary quota to unlock the exit door
16. Navigate to and enter the exit door to complete a level
17. Complete the level before the timer expires
18. View a level complete screen showing statistics after beating a level
19. Progress from Level 1 (Museum) to Level 2 (Bank) to Level 3 (Mansion)
20. Restart a level immediately upon being caught by a guard or camera
21. Restart a level immediately upon running out of time
22. Pause and unpause the game using the ESC key
23. View a victory screen upon completing all three levels
24. Return to the title screen after victory
25. Mute/unmute game sounds (optional feature)

## Diagrams

## 🤖 State Diagrams

> [!note]
> PlantUML code for these diagrams is provided separately. You can render them at [plantuml.com](http://www.plantuml.com/plantuml/uml/) or use a PlantUML extension in VS Code.

### Game State Machine

The main game flow transitions between different states based on player actions and game events.

![State Diagram](./assets/images/StateDiagram.png)

-   Game starts at **TitleScreenState**
-   Player can choose to view **InstructionsState** or jump to **PlayState**
-   During **PlayState**, pressing ESC enters **PauseState**
-   Getting caught or running out of time transitions to **GameOverState**
-   Completing a level's objectives transitions to **LevelCompleteState**
-   Completing all three levels transitions to **VictoryState**
-   Both **GameOverState** and **LevelCompleteState** offer options to retry or continue

### Player State Machine

The player character has three distinct movement states that affect gameplay mechanics.

![Player State Diagram](./assets/images/PlayerStateDiagram.png)

-   **IdleState**: Standing still, no movement input
-   **WalkingState**: Normal movement speed, standard detection range
-   **CrouchingState**: 50% movement speed, 60% detection range

### Guard State Machines

Guards have different state machines based on their type.

![Guard State Diagram](./assets/images/GuardStateDiagram.png)

**Patrol Guard:**

-   **PatrolState**: Moves along waypoint path
-   **AlertState**: Player detected, triggers level restart

**Stationary Guard:**

-   **IdleState**: Rotates vision cone in place
-   **AlertState**: Player detected, triggers level restart

## 🗺️ Class Diagram

The class diagram shows the relationships between all major classes in the game, including inheritance hierarchies and the factory pattern.

![Class Diagram](./assets/images/ClassDiagram.png)

### Key Relationships:

**Inheritance:**

-   `Player` and `Guard` both inherit from `Entity` (abstract base class)
-   `PatrolGuard` and `StationaryGuard` inherit from `Guard` (abstract class)
-   All game states inherit from `State` (abstract base class)

**Factory Pattern:**

-   `GuardFactory` creates instances of `PatrolGuard` and `StationaryGuard`
-   `ItemFactory` creates instances of `Item` with different types and values

**Composition:**

-   `Game` has a `StateMachine` and manages multiple `State` objects
-   `PlayState` contains a `Level`, `Player`, and `Timer`
-   `Level` contains a `TileMap`, multiple `Guard` objects, multiple `Camera` objects, multiple `Item` objects, and an `Exit`
-   `Guard` and `Camera` both have a `VisionCone` for detection

**Key Classes:**

-   **Entity**: Base class for all movable game objects (player, guards)
-   **Guard**: Abstract base class for enemy types with detection logic
-   **PatrolGuard**: Guard that moves along waypoints
-   **StationaryGuard**: Guard that stays in place and rotates
-   **VisionCone**: Handles detection area rendering and collision
-   **GuardFactory**: Creates different types of guards
-   **ItemFactory**: Creates collectible items with various values

## 🧵 Wireframes

### Title Screen

![Title Screen](./assets/images/TitleScreen.png)

-   **Play** - Starts a new game (goes to Instructions or directly to Level 1)
-   **Instructions** - Shows control scheme and gameplay rules
-   **High Scores** - Displays best completion times (optional feature)
-   Clean, thematic background with game title prominently displayed

### Instructions Screen

![Instructions Screen](./assets/images/InstructionsScreen.png)

-   Control scheme displayed (WASD, Shift, E, ESC)
-   Brief explanation of game objectives
-   Guard/camera detection mechanics explained
-   "Press ENTER to continue" prompt

### Gameplay Screen

![Gameplay Screen](./assets/images/GameplayScreen.png)

The main game interface showing active gameplay:

**HUD Elements (Top Bar):**

-   Left: Money collected / Quota (💰 $350 / $500)
-   Center: Timer countdown (⏱️ 2:45)
-   Right: Pause instruction (ESC - Pause)

**Main Play Area:**

-   Top-down view of the current level
-   Player character in green
-   Guards in red with vision cones shown
-   Security cameras in blue with detection arcs
-   Collectible items in gold
-   Exit door in purple (locked until quota met)
-   Walls and environmental tiles

**Visual Indicators:**

-   Vision cones rendered with transparency
-   Clear distinction between walkable and non-walkable tiles
-   Item values displayed when near them

### Level Complete Screen

![Level Complete Screen](./assets/images/LevelCompleteScreen.png)

-   "LEVEL COMPLETE!" message
-   Level name displayed (e.g., "Museum Heist Successful")
-   Statistics:
    -   Time taken to complete level
    -   Total money collected
    -   Bonus indicators (fast completion, no alerts)
-   "Press ENTER for next level" or "Press ENTER to return to menu"

### Victory Screen

![Victory Screen](./assets/images/VictoryScreen.png)

-   "ALL HEISTS COMPLETE!" celebratory message
-   Trophy or achievement graphic
-   Final statistics:
    -   Total money stolen across all levels
    -   Total time taken
    -   Perfect stealth achievement (if applicable)
-   "Press ENTER to return to title screen"

### Game Over Screen

![Game Over Screen](./assets/images/GameOverScreen.png)

-   "CAUGHT!" or "TIME'S UP!" message depending on failure type
-   Brief context (e.g., "The guards spotted you!")
-   Current progress displayed:
    -   Money collected vs quota needed
    -   Time remaining when caught
-   "Press ENTER to retry level"

### Level Layout Example

![Level Layout](./assets/images/LevelLayout.png)

Example showing the structure of a level:

-   Grid-based tilemap design
-   Player spawn point marked
-   Patrol guard with dotted line showing waypoint path
-   Stationary guard at chokepoint
-   Security camera with sweep arc
-   Items placed strategically (different values: $50, $100, $150)
-   Exit door at level endpoint
-   Legend explaining symbols (P=Player, PG=Patrol Guard, SG=Stationary Guard, C=Camera)

## Assets

### Sprites

-   **Player character** - Custom made, animated (idle, walk, crouch)
-   **Guards** - Custom made, animated (idle, walk)
-   **Security cameras** - Custom made or sourced from [itch.io](https://itch.io)
-   **Items** (jewelry, cash, paintings, etc.) - Custom made or sourced from [itch.io](https://itch.io)
-   **Tileset** (walls, floors, furniture) - Custom made from spritesheet or sourced from [itch.io](https://itch.io) or [OpenGameArt](https://opengameart.org)
-   **UI elements** - Custom made or sourced from [itch.io](https://itch.io)

### Sounds

-   **Background music** - Sneaky/heist themed music from [freesound.org](https://freesound.org) or [OpenGameArt](https://opengameart.org)
-   **Sound effects:**

    -   Footsteps (walking, crouching)
    -   Item pickup
    -   Alert sound (when caught)
    -   UI selection/confirmation
    -   Level complete jingle
    -   Victory fanfare
    -   Game over sound
    -   Door unlock (exit opens)

    Sources: [freesound.org](https://freesound.org), [OpenGameArt](https://opengameart.org)

### Fonts

-   **Title font** - Bold, stylized font from [Google Fonts](https://fonts.google.com) or [dafont](https://dafont.com)
-   **UI font** - Clean, readable font from [Google Fonts](https://fonts.google.com)

_All assets will be properly credited in the main.js file._

## Technical Details

### Libraries & Tools

-   **Game Engine:** Custom JavaScript/Canvas engine (based on course framework)
-   **Library Classes:**
    -   `Animation.js` - For sprite animations
    -   `Timer.js` - For tweening effects and time-based mechanics
    -   `Hitbox.js` - For collision detection
    -   `StateMachine.js` - For managing game and entity states

### Algorithms & Systems

-   **Vision Cone Detection:** Raycasting or area-based detection to determine if player is in guard/camera line of sight
-   **Pathfinding:** Simple waypoint-based patrolling for guards
-   **Collision Detection:** AABB (Axis-Aligned Bounding Box) for walls, items, and exit
-   **Local Storage:** Persisting high scores and potentially unlocked levels

### Level Design

Three levels with increasing complexity:

1. **Museum** - Open layout, fewer guards, longer timer (beginner-friendly)
2. **Bank** - Tighter corridors, more guards, moderate timer
3. **Mansion** - Complex multi-room layout, mix of all guard types and cameras, shorter timer

### Enums

```javascript
PlayerState = { Idle, Walking, Crouching };
GuardState = { Patrol, Alert, Idle };
GameState = {
    TitleScreen,
    Instructions,
    Play,
    Pause,
    LevelComplete,
    Victory,
    GameOver,
};
Direction = { Up, Down, Left, Right };
ItemType = { Cash, Jewelry, Painting, Artifact };
GuardType = { Patrol, Stationary };
```

## Implementation Plan

### Phase 1: Core Mechanics

-   Basic player movement and animation
-   Tilemap rendering and collision
-   Simple guard with vision cone detection

### Phase 2: Game States & UI

-   State machine implementation
-   Title screen, instructions, game over screens
-   HUD displaying quota, timer, money

### Phase 3: Content & Polish

-   Three complete levels
-   All guard types and cameras
-   Item variety and spawning
-   Sound effects and music

### Phase 4: Persistence & Final Features

-   High score system with local storage
-   Level unlocking
-   Juice (particles, screen effects, tweens)
-   Playtesting and balancing
