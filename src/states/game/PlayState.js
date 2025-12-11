import State from "../../../lib/State.js";
import Level from "../../services/Level.js";
import RoomName from "../../enums/RoomName.js";
import Vector from "../../../lib/Vector.js";

export default class PlayState extends State {
    constructor() {
        super();
        this.level = new Level();
    }

    async enter() {
        // Load all rooms
        await this.level.loadRoom(
            RoomName.MuseumEntrance,
            "../../config/museum-entrance.json"
        );

        // Start in the entrance
        this.level.setCurrentRoom(RoomName.MuseumEntrance, new Vector(13, 16));
    }

    update(dt) {
        this.level.update(dt);
    }

    render() {
        this.level.render();
    }
}
