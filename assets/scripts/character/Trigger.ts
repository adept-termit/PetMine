import {_decorator, Collider, Component, ITriggerEvent, Node, PhysicsSystem, Prefab} from 'cc';
import {worldData} from "db://assets/scripts/biomes/WorldData";
import {eventService} from "db://assets/scripts/core/utils/EventService";
import {blockProvider} from "db://assets/scripts/biomes/BlockProvider";
import {Chunk} from "db://assets/scripts/biomes/Chunk";

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

        // console.log( event.otherCollider.node.getParent().getComponent(Chunk))
        // event.otherCollider.node.getParent().getComponent(Chunk)
        // blockProvider.setActiveChunk(event.otherCollider.node.getParent().getComponent(Chunk));
    }

    private _onTriggerExit(event: ITriggerEvent) {
        // worldData.currentBiome = null
    }
}


