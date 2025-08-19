import { _decorator, Component, Vec3, Quat, Node } from 'cc';
const { ccclass } = _decorator;

function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

// Случайный юнит-вектор внутри сферы (равномерно по направлению)
function randomUnitVector(out: Vec3): Vec3 {
    // Метод Марсаглия
    let x = 0, y = 0, z = 0, s = 2;
    while (s >= 1 || s === 0) {
        x = randomRange(-1, 1);
        y = randomRange(-1, 1);
        s = x * x + y * y;
    }
    const f = Math.sqrt(1 - s);
    z = 2 * s - 1; // альтернативная форма; можно и через нормализацию случайного вектора
    // Надёжнее — просто нормализовать произвольный вектор:
    const v = new Vec3(randomRange(-1, 1), randomRange(-1, 1), randomRange(-1, 1));
    return Vec3.normalize(out, v);
}

// Смешиваем равномерный шум с направлением "вперёд" (bias ∈ [0..1])
function biasedDirection(forward: Vec3, bias: number, out = new Vec3()): Vec3 {
    const rand = randomUnitVector(new Vec3());
    // out = normalize( rand*(1-bias) + forward*bias )
    Vec3.multiplyScalar(out, rand, 1 - bias);
    const fwd = new Vec3(forward.x, forward.y, forward.z);
    Vec3.normalize(fwd, fwd);
    out.add(fwd.multiplyScalar(bias));
    if (out.length() < 1e-4) return randomUnitVector(out);
    return Vec3.normalize(out, out);
}

@ccclass('PartPhysics')
export class PartPhysics extends Component {
    // --- Настраиваемые параметры «физики»
    // Наследование скорости самолёта (0 — не наследуем, 1 — полностью)
    inheritVelFactor = 0.5;

    // Сила «взрыва» (м/с), базовая и разброс
    explosionSpeed = 25;
    explosionRand = 0.6; // 0..1 — насколько гуляет мощность

    // Смещение по направлению вперёд (0 — во все стороны, 1 — в основном вперёд)
    forwardBias = 0.35;

    // Гравитация и «воздух»
    gravity = new Vec3(0, -9.81, 0);
    // Коэфф. квадратичного сопротивления: dv = -k * |v| * v * dt
    airDragK = 0.02;
    // Лёгкое линейное затухание вращения
    angularDamping = 0.97;

    // Ограничения
    terminalSpeed = 120; // «терминалка» по модулю

    private velocity: Vec3 = new Vec3();
    private angularVel: Vec3 = new Vec3();
    private pos: Vec3 = new Vec3();
    private tmp: Vec3 = new Vec3();

    /**
     * @param initialVelocity скорость носителя (самолёта)
     * @param impulseDir «вперёд» для биаса (обычно forward самолёта); можно передать (0,0,0)
     * @param testMode более «взрывной» режим
     */
    init(initialVelocity: Vec3, impulseDir: Vec3, testMode: boolean = false) {
        this.pos.set(this.node.worldPosition);

        // --- Наследуем часть скорости самолёта
        Vec3.multiplyScalar(this.velocity, initialVelocity, this.inheritVelFactor);

        // --- Генерируем направление импульса с биасом вперёд
        const dir = biasedDirection(impulseDir, this.forwardBias);

        // --- Размер импульса (м/с)
        const spread = testMode ? 1.0 : this.explosionRand;
        const speedMul = 1 + randomRange(-spread, spread);
        const kick = (testMode ? this.explosionSpeed * 1.6 : this.explosionSpeed) * Math.max(0.2, speedMul);

        // v += dir * kick
        Vec3.scaleAndAdd(this.velocity, this.velocity, dir, kick);

        // Доп. небольшой шум по всем осям
        this.velocity.x += randomRange(-5, 5);
        this.velocity.y += randomRange(-2, 6);
        this.velocity.z += randomRange(-5, 5);

        // Угловая скорость (°/с): в рад/с конвертить не обязательно — мы в fromEuler
        this.angularVel.set(
            randomRange(-240, 240),
            randomRange(-240, 240),
            randomRange(-240, 240)
        );

        this.node.active = true;
    }

    update(dt: number) {
        // Гравитация
        Vec3.scaleAndAdd(this.velocity, this.velocity, this.gravity, dt);

        // Квадратичное сопротивление воздуха: dv = -k * |v| * v * dt
        const speed = this.velocity.length();
        if (speed > 1e-6) {
            const dragMag = this.airDragK * speed * speed;
            // v -= normalize(v) * dragMag * dt
            Vec3.normalize(this.tmp, this.velocity);
            Vec3.scaleAndAdd(this.velocity, this.velocity, this.tmp, -dragMag * dt);
        }

        // Клип по терминальной скорости
        const newSpeed = this.velocity.length();
        if (newSpeed > this.terminalSpeed) {
            Vec3.multiplyScalar(this.velocity, this.velocity, this.terminalSpeed / newSpeed);
        }

        // --- Обновление позиции
        Vec3.scaleAndAdd(this.pos, this.pos, this.velocity, dt);
        this.node.setWorldPosition(this.pos);

        // --- Обновление вращения
        const currentRot = this.node.getWorldRotation();
        const dq = new Quat();
        Quat.fromEuler(dq, this.angularVel.x * dt, this.angularVel.y * dt, this.angularVel.z * dt);
        const out = new Quat();
        Quat.multiply(out, currentRot, dq);
        this.node.setWorldRotation(out);

        // --- Демпфинг угловой скорости
        Vec3.multiplyScalar(this.angularVel, this.angularVel, this.angularDamping);
    }
}
