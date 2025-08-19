import {_decorator, Component, Node, Vec3, Quat, math, Collider, ITriggerEvent} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowCamera')
export class FollowCamera extends Component {
    @property(Node)
    target: Node | null = null;

    @property(Vec3)
    localOffset: Vec3 = new Vec3(0, 4.5, 15);

    private targetWorldPos = new Vec3();
    private offsetWorld = new Vec3();
    private camPos = new Vec3();
    private yawQuat = new Quat();

    lateUpdate(dt: number) {
        if (!this.target) return;

        // мировая позиция цели
        this.target.getWorldPosition(this.targetWorldPos);

        // берем только Y поворот (yaw)
        const targetRot = this.target.getWorldRotation();
        const euler = new math.Vec3();
        Quat.toEuler(euler, targetRot);
        Quat.fromEuler(this.yawQuat, 0, euler.y, 0);  // только yaw!

        // офсет вращаем только по yaw
        Vec3.transformQuat(this.offsetWorld, this.localOffset, this.yawQuat);

        // итоговая позиция камеры
        Vec3.add(this.camPos, this.targetWorldPos, this.offsetWorld);
        this.node.setWorldPosition(this.camPos);

        // камера всегда смотрит на цель
        this.node.lookAt(this.targetWorldPos, Vec3.UP);
    }
}