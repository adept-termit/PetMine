import {_decorator, Collider, Component, ITriggerEvent, Node} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CubeTrigger')
export class CubeTrigger extends Component {
    @property({type: Collider}) trigger: Collider;

    onDisable() {
        this.trigger.off("onTriggerExit", this._onTriggerExit, this);

    }

    onEnable() {
        this.trigger.on('onTriggerEnter', this._onTriggerEnter, this);
    }


    private _onTriggerExit(event: ITriggerEvent) {
        console.log(event.otherCollider.node.name)
    }

    private _onTriggerEnter(event: ITriggerEvent) {
        console.log(event.otherCollider.node.name)
    }
}


