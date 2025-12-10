import State from "../../../lib/State.js";
import Map from "../../services/Map.js";

export default class PlayState extends State {
    constructor(mapDefinition) {
        super();

        this.map = new Map(mapDefinition);
    }

    update(dt) {
        this.map.update(dt);
    }

    render() {
        this.map.render();
    }
}
