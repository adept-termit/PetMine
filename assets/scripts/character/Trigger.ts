import {_decorator, Collider, Component, ITriggerEvent, Node, PhysicsSystem, Prefab} from 'cc';
import {worldData} from "db://assets/scripts/biomes/WorldData";

const {ccclass, property} = _decorator;

@ccclass('Trigger')
export class Trigger extends Component {
    @property({type: Collider}) trigger: Collider;

    onDisable() {
        this.trigger.off('onTriggerEnter', this._onTriggerEnter, this);
        this.trigger.off("onTriggerExit", this._onTriggerExit, this);
    }

    onEnable() {
        this.trigger.on('onTriggerEnter', this._onTriggerEnter, this);
        this.trigger.on("onTriggerExit", this._onTriggerExit, this);
    }

    start() {

    }

    update(deltaTime: number) {

    }

    private _onTriggerEnter(event: ITriggerEvent) {
        const currentBiome = event.otherCollider.node.getParent().name
        if (worldData.currentBiome != currentBiome) {
            worldData.currentBiome = currentBiome
        }
    }

    private _onTriggerExit(event: ITriggerEvent) {
        worldData.currentBiome = null
    }
}


