import State from "../../../lib/State.js";
import Level from "../../services/Level.js";
import RoomName from "../../enums/RoomName.js";
import Vector from "../../../lib/Vector.js";

export default class PlayState extends State {
    constructor() {
        super();
        this.level = new Level();
        this.isLoaded = false; // Add loading flag
    }

    async enter() {
        console.log("PlayState: Loading rooms...");

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

        this.isLoaded = true; // Mark as loaded
        console.log("PlayState: All rooms loaded!");
    }

    update(dt) {
        // Don't update until rooms are loaded
        if (!this.isLoaded) {
            return;
        }

        this.level.update(dt);
    }

    render() {
        // Don't render until rooms are loaded
        if (!this.isLoaded) {
            // Optionally show a loading screen
            return;
        }

        this.level.render();
    }
}
