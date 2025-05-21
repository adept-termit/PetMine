import {_decorator, Collider, Component, ITriggerEvent, Node, PhysicsSystem, Prefab} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('Interaction')
export class Interaction extends Component {
    @property({type: PhysicsSystem.PhysicsGroup}) interactionGroup = PhysicsSystem.PhysicsGroup.DEFAULT;
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
        console.log( event.otherCollider.node)
        console.log( event.otherCollider.getGroup())
    }

    private _onTriggerExit(event: ITriggerEvent) {
        console.log( event.otherCollider.node)
    }
}


