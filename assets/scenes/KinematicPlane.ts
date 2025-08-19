import {
    _decorator,
    Component,
    Node,
    Vec3,
    Quat,
    input,
    Input,
    EventKeyboard,
    KeyCode,
    PhysicsSystem,
    EPhysicsDrawFlags,
    geometry,
    Collider,
    ITriggerEvent,
    randomRange
} from 'cc';
import { PartPhysics } from "db://assets/scenes/PartPhysics";

const { ccclass, property } = _decorator;

@ccclass('PlaneController')
export class PlaneController extends Component {




    @property baseSpeed: number = 50;
    @property boostSpeed: number = 20;
    @property acceleration: number = 5;
    @property turnSpeed: number = 60;
    @property turnMultiplier: number = 1.5;
    @property maxRoll: number = 30;
    @property rollSpeed: number = 90;

    private pressingW = false;
    private pressingS = false;
    private pressingA = false;
    private pressingD = false;

    private yawDeg = 0;
    private rollDeg = 0;
    private currentSpeed = 0;

    private tmpPos = new Vec3();
    private forwardXZ = new Vec3();
    private movePos = new Vec3();

    private tmpRay = new geometry.Ray();
    @property checkDistance = 10;
    @property sphereRadius = 2;

    @property fuel: number = 100;
    @property fuelConsumption: number = 1;
    @property propellerPower: number = 50;
    @property lift: number = 1;
    @property stability: number = 1;

    private readonly MAX_SPEED = 170;

    private extraVelocity: Vec3 = new Vec3();
    private angularImpulse: Vec3 = new Vec3();

    onLoad() {
        PhysicsSystem.instance.debugDrawFlags =
            EPhysicsDrawFlags.WIRE_FRAME | EPhysicsDrawFlags.AABB;

        this.node.children.forEach((child) => {
            const collider = child.getComponent(Collider);
            if (collider) {
                collider.on('onTriggerEnter', (event: ITriggerEvent) => {
                    this.onPartTriggerEnter(child, event);
                });
            }
        });

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    private onKeyDown(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_W: this.pressingW = true; break;
            case KeyCode.KEY_S: this.pressingS = true; break;
            case KeyCode.KEY_A: this.pressingA = true; break;
            case KeyCode.KEY_D: this.pressingD = true; break;
        }
    }

    private onKeyUp(e: EventKeyboard) {
        switch (e.keyCode) {
            case KeyCode.KEY_W: this.pressingW = false; break;
            case KeyCode.KEY_S: this.pressingS = false; break;
            case KeyCode.KEY_A: this.pressingA = false; break;
            case KeyCode.KEY_D: this.pressingD = false; break;
        }
    }

    update(dt: number) {
        // --- 1. Топливо ---
        this.fuel -= this.fuelConsumption * dt;
        if (this.fuel < 0) this.fuel = 0;

        // --- 2. Скорость ---
        let targetSpeed = this.baseSpeed;
        if (this.pressingW) targetSpeed += this.boostSpeed;
        if (this.fuel <= 0) targetSpeed *= 0.5;
        if (targetSpeed > this.MAX_SPEED) targetSpeed = this.MAX_SPEED;
        this.currentSpeed = targetSpeed;

        // --- 3. Управление поворотами ---
        if (this.pressingA) this.yawDeg += this.turnSpeed * this.turnMultiplier * dt;
        if (this.pressingD) this.yawDeg -= this.turnSpeed * this.turnMultiplier * dt;

        let targetRoll = 0;
        if (this.pressingA) targetRoll = this.maxRoll;
        if (this.pressingD) targetRoll = -this.maxRoll;

        if (this.rollDeg < targetRoll) {
            this.rollDeg += this.rollSpeed * dt;
            if (this.rollDeg > targetRoll) this.rollDeg = targetRoll;
        } else if (this.rollDeg > targetRoll) {
            this.rollDeg -= this.rollSpeed * dt;
            if (this.rollDeg < targetRoll) this.rollDeg = targetRoll;
        }

        // --- 4. Применяем вращение самолёта ---
        this.node.setRotationFromEuler(0, this.yawDeg, this.rollDeg);

        // --- 5. Движение ---
        const localForward = new Vec3(0, 0, -1);
        Vec3.transformQuat(this.forwardXZ, localForward, this.node.getWorldRotation());
        this.forwardXZ.normalize();

        this.node.getWorldPosition(this.tmpPos);
        Vec3.scaleAndAdd(this.movePos, this.tmpPos, this.forwardXZ, this.currentSpeed * dt);
        Vec3.scaleAndAdd(this.movePos, this.movePos, this.extraVelocity, dt);
        this.node.setWorldPosition(this.movePos);

        // --- 6. Вращение от ударов ---
        const rot = this.node.getWorldRotation();
        const q = new Quat();
        Quat.fromEuler(
            q,
            this.angularImpulse.x * dt,
            this.angularImpulse.y * dt,
            this.angularImpulse.z * dt
        );
        Quat.multiply(rot, rot, q);
        this.node.setWorldRotation(rot);

        // --- 6.1 Автостабилизация (зависит от скорости) ---
        // Чем выше скорость, тем сильнее стабилизирующий эффект
        const speedFactor = this.currentSpeed / this.MAX_SPEED; // 0..1
        const stab = 0.95 + 0.04 * speedFactor; // при малой скорости = 0.95, при максимальной ≈ 0.99

        this.angularImpulse.x *= stab; // тангаж
        this.angularImpulse.z *= stab; // крен

        // --- 7. Затухание импульсов ---
        Vec3.multiplyScalar(this.extraVelocity, this.extraVelocity, 0.95);
        Vec3.multiplyScalar(this.angularImpulse, this.angularImpulse, 0.9);
    }

    private onPartTriggerEnter(partNode: Node, event: ITriggerEvent) {


        const planeVelocity = new Vec3();
        Vec3.multiplyScalar(planeVelocity, this.forwardXZ, this.currentSpeed);

        const offset = new Vec3();
        Vec3.subtract(offset, partNode.worldPosition, this.node.worldPosition);
        Vec3.normalize(offset, offset);
        Vec3.multiplyScalar(offset, offset, randomRange(5, 20));

        const worldPos = partNode.getWorldPosition();
        partNode.parent = this.node.scene;
        partNode.setWorldPosition(worldPos);
        const pp = partNode.addComponent(PartPhysics);
        pp.init(planeVelocity, offset, false);

        // --- Отдача от части ---
        const recoil = offset.clone();
        Vec3.multiplyScalar(recoil, recoil, -0.2);
        Vec3.add(this.extraVelocity, this.extraVelocity, recoil);

        // --- ФИКСИРОВАННЫЙ ОТСКОК НАЗАД ---
        const backward = this.forwardXZ.clone();
        const fixedBounceDistance = 10; // фиксированная дистанция отскока
        Vec3.normalize(backward, backward);
        Vec3.multiplyScalar(backward, backward, fixedBounceDistance);
        // Сбрасываем прошлый отскок и применяем только этот
        this.extraVelocity.set(backward.x, backward.y, backward.z);

        // --- Случайное вращение ---
        this.angularImpulse.x += randomRange(-1, 1);
        this.angularImpulse.y += randomRange(-0.5, 0.5);
        this.angularImpulse.z += randomRange(-1, 1);

        // --- Легкое снижение скорости ---
        this.currentSpeed *= 0.95;

        console.log(`Кусок ${partNode.name} отлетел. Самолёт получил фиксированный отскок назад: ${backward}`);
    }


}
