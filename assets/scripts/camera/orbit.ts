import {
    _decorator,
    Component,
    Node,
    math,
    sys,
    CCFloat,
    Vec3,
    geometry,
    PhysicsSystem, EPhysicsDrawFlags, Camera
} from 'cc';
import {AbstractInput, Desktop, Mobile} from "db://assets/scripts/camera/Input";


const {ccclass, property} = _decorator;

@ccclass('orbit')
export class orbit extends Component {
    @property({type: Vec3}) offset: Vec3 = new Vec3(0, 3, 0); // Смещение камеры относительно объекта

    @property({type: CCFloat, tooltip: "Значения 0 даст бесконечный предел расстояния"}) distanceMin: number = 5;
    @property({type: CCFloat, tooltip: "Значения 0 даст бесконечный предел расстояния"}) distanceMax: number = 14;

    @property({type: CCFloat, tooltip: "Макс угол наклона (градусы)"}) pitchAngleMax: number = 90;
    @property({type: CCFloat, tooltip: "Мин угол наклона (градусы)"}) pitchAngleMin: number = -90;

    @property({type: CCFloat, tooltip: "Как быстро камера движется по орбите"}) orbitSensitivity: number = 0.2;


    @property({type: CCFloat, tooltip: "Начальный угол поворота (вокруг вертикали)"}) startYaw: number = 0;
    @property({type: CCFloat, tooltip: "Начальный угол наклона камеры (вниз/вверх)"}) startPitch: number = -10;
    @property({type: CCFloat, tooltip: "Начальное расстояние до объекта"}) startDistance: number = 5;

    @property({type: CCFloat})
    minCharacterViewDistance: number = 3; // Минимальное расстояние, чтобы персонаж влезал в кадр

    @property({type: CCFloat})
    fovMin: number = 80;

    @property({type: CCFloat})
    fovMax: number = 80;

    @property({type: CCFloat})
    narrowSpaceThreshold: number = 1.2; // если расстояние до препятствия < этого, считаем, что пространство узкое

    private _focusEntity: Node;
    private _currentInput: AbstractInput;
    private _ray: geometry.Ray;

    private _yaw: number = 45;
    private _pitch: number = -45;

    private _distance: number = 7;
    private _obstacleAvoidanceDistance: number;

    get focusEntity(): Node {
        return this._focusEntity;
    }

    set focusEntity(value: Node) {
        this._focusEntity = value;
    }

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

    onLoad() {
        if (PhysicsSystem.instance) {
            PhysicsSystem.instance.debugDrawFlags = EPhysicsDrawFlags.WIRE_FRAME | EPhysicsDrawFlags.AABB;
        }

        this._yaw = this.startYaw;
        this._pitch = this.startPitch;
        this._distance = math.clamp(this.startDistance, this.distanceMin, this.distanceMax);
        this._obstacleAvoidanceDistance = this._distance;

        this._currentInput = sys.isMobile === true ? new Mobile(this) : new Desktop(this);

        this._updatePosition();
    }

    onEnable() {
        this._currentInput.enabled = true;
    }

    onDisable() {
        this._currentInput.enabled = false;
    }

    update(dt: number): void {
        if (!this._focusEntity) return;

        this._obstacleAvoidance();
    }

    lateUpdate(dt: number) {
        if (!this._focusEntity) return;

        this._updatePosition();
    }

    _obstacleAvoidance() {
        const focus = this._focusEntity.getWorldPosition().add(this.offset);

        const camera = new Vec3(this.node.worldPosition).subtract(focus).normalize();

        this._ray = new geometry.Ray(focus.x, focus.y, focus.z, camera.x, camera.y, camera.z);

        const sphereRadius = 0.1
        const halfSphereRadius = sphereRadius * 0.5
        const result = PhysicsSystem.instance.sweepSphereClosest(
            this._ray,
            sphereRadius,
            PhysicsSystem.PhysicsGroup.WORLD_STATIC | PhysicsSystem.PhysicsGroup.CHUNK_BLOCK,
            this._distance - halfSphereRadius,
            false
        );

        if (result) {
            const sweepResult = PhysicsSystem.instance.sweepCastClosestResult;
            const hitDistance = sweepResult.distance;

            this._obstacleAvoidanceDistance = hitDistance - halfSphereRadius;
        } else {
            this._obstacleAvoidanceDistance = this.distanceMax;
        }
    }

    private _updatePosition() {

        let position = this.node.getPosition();

        const distance = Math.min(this._distance, this._obstacleAvoidanceDistance);

        this.node.setRotationFromEuler(this._pitch, this._yaw, 0);
        position.set(this.node.forward);
        position.multiplyScalar(-distance);
        position.add(this._focusEntity.worldPosition);
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

