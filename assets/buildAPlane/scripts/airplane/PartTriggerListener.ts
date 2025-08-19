import {_decorator, Collider, Component, ITriggerEvent, Node} from 'cc';
import {PlaneController} from "db://assets/scenes/KinematicPlane";

const {ccclass, property} = _decorator;

@ccclass('PartTriggerListener')
export class PartTriggerListener extends Component {
    @property(Node) controllerNode: Node;

    private collider: Collider;
    private firedThisFrame = false;

    onEnable() {
        this.collider = this.getComponent(Collider);
        this.collider.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    onDisable() {
        this.collider.off('onTriggerEnter', this.onTriggerEnter, this);
    }

    lateUpdate() {
        this.firedThisFrame = false;
    }

    private onTriggerEnter(event: ITriggerEvent) {
        console.log(this.node.name);
        if (this.firedThisFrame) return;
        this.firedThisFrame = true;

        const controllerNode = this.controllerNode.getComponent(PlaneController);
        controllerNode.onPartTriggerEnter(this.node, event);
    }
}

