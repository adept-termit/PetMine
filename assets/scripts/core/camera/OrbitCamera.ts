import {
    _decorator,
    Component,
    Node,
    math,
    sys,
    CCFloat,
    Vec3,
    geometry,
    PhysicsSystem, EPhysicsDrawFlags
} from 'cc';

import {IOrbitCameraInput} from "db://assets/scripts/core/camera/IOrbitCameraInput";
import {OrbitCameraInputMouse} from "db://assets/scripts/core/camera/OrbitCameraInputMouse";


const {ccclass, property} = _decorator;

@ccclass('OrbitCamera')
export class OrbitCamera extends Component {
    @property({type: Vec3}) offset: Vec3 = new Vec3(0, 3, 0); // Смещение камеры относительно объекта

    @property({type: CCFloat, tooltip: "Значения 0 даст бесконечный предел расстояния"}) distanceMin: number = 5;
    @property({type: CCFloat, tooltip: "Значения 0 даст бесконечный предел расстояния"}) distanceMax: number = 14;

    @property({type: CCFloat, tooltip: "Макс угол наклона (градусы)"}) pitchAngleMax: number = 90;
    @property({type: CCFloat, tooltip: "Мин угол наклона (градусы)"}) pitchAngleMin: number = -90;

    @property({type: CCFloat, tooltip: "Как быстро камера движется по орбите"}) orbitSensitivity: number = 0.2;

    @property({type: Node}) focusEntity: Node; // Целевой объект камеры

    @property({ type: PhysicsSystem.PhysicsGroup }) obstaclesGroup = PhysicsSystem.PhysicsGroup.DEFAULT;

    private _currentInput: IOrbitCameraInput;
    private _ray: geometry.Ray;

    private _yaw: number = 45;
    private _pitch: number = -45;

    private _distance: number = 7;
    private _obstacleAvoidanceDistance: number;

    get yaw(): number {
        return this._yaw;
    }

    set yaw(value: number) {
        this._yaw = value % 360;
    }

    get pitch(): number {
        return this._pitch;
    }

    set pitch(value: number) {
        this._pitch = this._clampPitchAngle(value);
    }

    get distance(): number {
        return this._distance;
    }

    set distance(value: number) {
        this._distance = this._clampDistance(value);
    }

    start() {
        PhysicsSystem.instance.debugDrawFlags = EPhysicsDrawFlags.WIRE_FRAME | EPhysicsDrawFlags.AABB;

        this._obstacleAvoidanceDistance = this.distanceMax;
        this._currentInput = sys.isMobile === true ? new OrbitCameraInputMouse(this) : new OrbitCameraInputMouse(this);
        this._currentInput.enable();
    }

    update(): void {
        if (!this.focusEntity) return;

        this._obstacleAvoidance();

        this._distance = Math.min(this._distance, this._obstacleAvoidanceDistance);
    }

    lateUpdate(dt: number) {
        if (!this.focusEntity) return;

        this._updatePosition();
    }

    _obstacleAvoidance() {
        const focus = this.focusEntity.getWorldPosition().add(this.offset);
        const camera = new Vec3(this.node.worldPosition).subtract(focus).normalize();

        this._ray = new geometry.Ray(focus.x, focus.y, focus.z, camera.x, camera.y, camera.z);

        const result = PhysicsSystem.instance.sweepSphereClosest(this._ray, 0.5, undefined, this._distance - 0.05, false);

        if (result) {
            const sweepResult = PhysicsSystem.instance.sweepCastClosestResult;
            const hitDistance = sweepResult.distance;
            this._obstacleAvoidanceDistance = math.clamp(hitDistance, 0.25, this.distanceMax);
        } else {
            this._obstacleAvoidanceDistance = this.distanceMax;
        }
    }

    private _updatePosition() {
        let position = this.node.getPosition();

        this.node.setRotationFromEuler(this._pitch, this._yaw, 0);
        position.set(this.node.forward);
        position.multiplyScalar(-this._distance);
        position.add(this.focusEntity.worldPosition);
        position.add(this.offset);

        this.node.setWorldPosition(position);
    }

    private _clampPitchAngle(pitch: number): number {
        return math.clamp(pitch, -this.pitchAngleMax, -this.pitchAngleMin);
    }

    private _clampDistance(distance: number): number {
        if (this.distanceMax > 0) {
            return math.clamp(distance, this.distanceMin, this.distanceMax);
        }

        return Math.max(distance, this.distanceMin);
    }
}
