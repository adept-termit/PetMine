import {
    _decorator,
    Component,
    EventMouse,
    EventTouch,
    geometry,
    Input,
    input,
    Node,
    Camera,
    PhysicsSystem,
    Vec3
} from 'cc';
import {ChunkGenerator} from "db://assets/scripts/core/chunk/ChunkGenerator";

const {ccclass, property} = _decorator;

@ccclass('Hit')
export class Hit extends Component {
    @property({type: Camera}) camera: Camera;
    @property({type: Node}) sphere?: Node;

    private _ray: geometry.Ray = new geometry.Ray();
    private _chunkGenerator: ChunkGenerator;

    onLoad() {
        this._chunkGenerator = this.node.getComponent(ChunkGenerator)
    }

    onEnable() {
        input.on(Input.EventType.MOUSE_DOWN, this._onInput, this);
        //input.on(Input.EventType.TOUCH_START, this._onInput, this);
    }

    onDisable() {
        input.off(Input.EventType.MOUSE_DOWN, this._onInput, this);
        // input.off(Input.EventType.TOUCH_START, this._onInput, this);
    }

    private _onInput(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_LEFT) {

            const location = event.getLocation();
            this.camera.screenPointToRay(location.x, location.y, this._ray);

            if (PhysicsSystem.instance.raycastClosest(this._ray)) {

                const raycastResults = PhysicsSystem.instance.raycastClosestResult;
                const hitPoint = raycastResults.hitPoint;
                this.sphere?.setWorldPosition(hitPoint);

                const localHitPoint = this._chunkGenerator.node.inverseTransformPoint(new Vec3(), hitPoint);
                const hitNormal = raycastResults.hitNormal;
                const offset = 0.02;

                const localPositionInChunk = new Vec3(
                    Math.floor(localHitPoint.x - (hitNormal.x > 0 ? offset : -offset)),
                    Math.floor(localHitPoint.y - (hitNormal.y > 0 ? offset : -offset)),
                    Math.floor(localHitPoint.z - (hitNormal.z > 0 ? offset : -offset))
                );
                console.log(123)
                console.log(localPositionInChunk)
                this._chunkGenerator.reGenerateChunk(localPositionInChunk);
            }
        }
    }
}
