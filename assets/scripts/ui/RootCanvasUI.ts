import {_decorator, Camera, Component, MeshRenderer, Node} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RootCanvasUi')
export class RootCanvasUi extends Component {
    @property(Node) hud: Node;
    @property(Node) pickaxeTab: Node;
    @property(Camera) camera: Camera;

    start() {

    }

    update(deltaTime: number) {
        
    }
}


