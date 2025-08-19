import {_decorator, Collider, Component, ITriggerEvent, Node} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('CraftingPlatform')
export class CraftingPlatform extends Component {
    @property({type: Collider}) trigger: Collider;

    onDisable() {
        this.trigger.off("onTriggerExit", this._onTriggerExit, this);

    }

    onEnable() {
        this.trigger.on('onTriggerEnter', this._onTriggerEnter, this);
    }

    start() {

    }

    update(deltaTime: number) {

    }

    private _onTriggerExit(event: ITriggerEvent) {
        // console.log(event.otherCollider.node.name)
    }

    private _onTriggerEnter(event: ITriggerEvent) {
        // console.log(event.otherCollider.node.name)
    }
}


