import { _decorator, Component, Vec3, Quat } from 'cc';
const { ccclass } = _decorator;

function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

@ccclass('PartPhysics')
export class PartPhysics extends Component {
    private velocity: Vec3 = new Vec3();
    private angularVel: Vec3 = new Vec3();
    private pos: Vec3 = new Vec3();

    init(initialVelocity: Vec3, impulseDir: Vec3, testMode: boolean = false) {
        this.pos.set(this.node.worldPosition);

        // Наследуем скорость от самолета
        this.velocity.set(initialVelocity);

        // Добавляем импульс (разлёт в сторону)
        Vec3.add(this.velocity, this.velocity, impulseDir);

        // Чуть хаоса сверху
        if (testMode) {
            this.velocity.x += randomRange(-50, 50);
            this.velocity.y += randomRange(20, 40);
            this.velocity.z += randomRange(-50, 50);
        } else {
            this.velocity.x += randomRange(-10, 10);
            this.velocity.y += randomRange(0, 5);
            this.velocity.z += randomRange(-10, 10);
        }

        // Угловая скорость (вращение при разрыве)
        this.angularVel.set(
            randomRange(-180, 180),
            randomRange(-180, 180),
            randomRange(-180, 180)
        );

        this.node.active = true;
    }

    update(dt: number) {
        // Движение по скорости
        Vec3.scaleAndAdd(this.pos, this.pos, this.velocity, dt);
        this.node.setWorldPosition(this.pos);

        // Вращение по угловой скорости
        const rot = this.node.getWorldRotation();
        const q = new Quat();
        Quat.fromEuler(q, this.angularVel.x * dt, this.angularVel.y * dt, this.angularVel.z * dt);
        Quat.multiply(rot, rot, q);
        this.node.setWorldRotation(rot);

        // Затухание
        Vec3.multiplyScalar(this.velocity, this.velocity, 0.985);
        Vec3.multiplyScalar(this.angularVel, this.angularVel, 0.97);
    }
}
