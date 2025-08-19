import {
    _decorator, Component, Node, Vec3, Quat,
    input, Input, EventKeyboard, KeyCode,
    PhysicsSystem, EPhysicsDrawFlags,
    Collider, ITriggerEvent, randomRange,
} from 'cc';
import {PartPhysics} from 'db://assets/scenes/PartPhysics';

const {ccclass, property} = _decorator;

@ccclass('PlaneController')
export class PlaneController extends Component {
    // ======= Движение / управление =======
    @property baseSpeed = 50;
    @property boostSpeed = 20;
    @property turnSpeed = 60;
    @property turnMultiplier = 1.5;
    @property maxRoll = 30;
    @property rollSpeed = 90;

// ======= «Мягкий» отскок (ускорение, без телепорта) =======
    @property pushPeak = 6000;    // из "5–7k": взял 6k; крути 5000..7000
    @property pushRelease = 0.16; // короткий и мощный
    @property linearDamp = 0.88;  // подольше держим добавочную скорость
    @property sideYawGain = 160;  // разворот ощутимый, но без «переворота»

    // ======= Замедление после удара =======
    @property slowMulOnHit = 0.30;   // -70% скорости (остаётся 30%)
    @property slowHoldTime = 0.7;    // держим минималку перед восстановлением
    @property slowRecoverTime = 6.0; // затем плавно возвращаем за 6 c (итого 6.7 c)

// ======= Классификация удара =======
    @property({tooltip: 'Порог |X| в лок. коорд. для бокового удара'}) sideXMin = 0.25;
    @property({tooltip: 'Макс. |Z|, чтобы не считать удар фронтальным'}) frontZMax = 0.8;

    @property({tooltip: 'Время плавного набора силы отскока (сек)'})
    pushRise = 0.19; // 70 мс — сгладит «резкость»


    // ======= Прочее =======
    @property fuel = 100;
    @property fuelConsumption = 1;
    @property lift = 1;

    private readonly MAX_SPEED = 170;

    // --- input
    private pressingW = false;
    private pressingS = false;
    private pressingA = false;
    private pressingD = false;

    // --- состояние
    private yawDeg = 0;
    private rollDeg = 0;
    private currentSpeed = 0;

    // --- вектора / кеш
    private forward = new Vec3();      // world forward
    private right = new Vec3();        // world right
    private tmp = new Vec3();
    private nextPos = new Vec3();

    // --- «псевдо-физика» (линейная + угловая)
    private extraVel = new Vec3();     // добавочная скорость (м/с)
    private pushAcc = new Vec3();      // текущее ускорение от отскока (м/с²)
    private pushTimer = 0;             // таймер действия ускорения
    private angImpulse = new Vec3();   // град/с: (x=pitch, y=yaw, z=roll)

    // --- восстановление скорости
    private speedMul = 1;
    private recoverTimer = 0;

    private recoverHold = 0;

    // ======= LIFECYCLE =======
    onLoad() {
        // включай при надобности
        PhysicsSystem.instance.debugDrawFlags = EPhysicsDrawFlags.WIRE_FRAME | EPhysicsDrawFlags.AABB;

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);


    }

    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    // ======= INPUT =======
    private onKeyDown(e: EventKeyboard) {
        if (e.keyCode === KeyCode.KEY_W) this.pressingW = true;
        if (e.keyCode === KeyCode.KEY_S) this.pressingS = true;
        if (e.keyCode === KeyCode.KEY_A) this.pressingA = true;
        if (e.keyCode === KeyCode.KEY_D) this.pressingD = true;
    }

    private onKeyUp(e: EventKeyboard) {
        if (e.keyCode === KeyCode.KEY_W) this.pressingW = false;
        if (e.keyCode === KeyCode.KEY_S) this.pressingS = false;
        if (e.keyCode === KeyCode.KEY_A) this.pressingA = false;
        if (e.keyCode === KeyCode.KEY_D) this.pressingD = false;
    }

    // ======= UPDATE =======
    update(dt: number) {
        this.consumeFuel(dt);
        this.updateSteer(dt);
        this.updateFrameBasis();     // forward/right
        this.updateSoftPush(dt);     // интегрируем ускорение в скорость
        this.move(dt);               // перемещение
        this.stabilize(dt);          // затухание импульсов / автопилотик
    }

    // ======= Топливо / целевая скорость / восстановление =======
    private consumeFuel(dt: number) {
        this.fuel = Math.max(0, this.fuel - this.fuelConsumption * dt);

        let target = this.baseSpeed + (this.pressingW ? this.boostSpeed : 0);
        if (this.fuel <= 0) target *= 0.5;
        target = Math.min(target, this.MAX_SPEED);

        // двухфазное восстановление: hold -> плавный подъём (smoothstep)
        if (this.recoverHold > 0) {
            this.recoverHold = Math.max(0, this.recoverHold - dt);
            this.speedMul = Math.min(this.speedMul, this.slowMulOnHit);
        } else if (this.recoverTimer > 0) {
            this.recoverTimer = Math.max(0, this.recoverTimer - dt);
            const t = 1 - (this.recoverTimer / this.slowRecoverTime); // 0..1
            const s = t * t * (3 - 2 * t); // smoothstep
            this.speedMul = this.slowMulOnHit + (1 - this.slowMulOnHit) * s;
        } else {
            this.speedMul = 1;
        }

        this.currentSpeed = target * this.speedMul;
    }

    // ======= Повороты от ввода + угловые импульсы от ударов =======
    private updateSteer(dt: number) {
        if (this.pressingA) this.yawDeg += this.turnSpeed * this.turnMultiplier * dt;
        if (this.pressingD) this.yawDeg -= this.turnSpeed * this.turnMultiplier * dt;

        let targetRoll = 0;
        if (this.pressingA) targetRoll = this.maxRoll;
        if (this.pressingD) targetRoll = -this.maxRoll;

        // наклон к таргету
        if (this.rollDeg < targetRoll) this.rollDeg = Math.min(this.rollDeg + this.rollSpeed * dt, targetRoll);
        else if (this.rollDeg > targetRoll) this.rollDeg = Math.max(this.rollDeg - this.rollSpeed * dt, targetRoll);

        // добавляем «физические» угловые импульсы
        this.yawDeg += this.angImpulse.y * dt;
        this.rollDeg += this.angImpulse.z * 0.15 * dt;

        this.node.setRotationFromEuler(0, this.yawDeg, this.rollDeg);
    }

    // ======= Базис: forward/right (world) =======
    private updateFrameBasis() {
        const rot = this.node.getWorldRotation();
        // forward (0,0,-1) в world
        Vec3.transformQuat(this.forward, new Vec3(0, 0, -1), rot);
        this.forward.normalize();
        // right (1,0,0) в world
        Vec3.transformQuat(this.right, new Vec3(1, 0, 0), rot);
        this.right.normalize();
    }

    // ======= Мягкий отскок: ускорение -> скорость =======
    private updateSoftPush(dt: number) {
        if (this.pushTimer > 0) {
            const total = this.pushRise + this.pushRelease;
            const elapsed = total - this.pushTimer; // сколько прошло с начала импульса
            let a = 0; // амплитуда 0..1

            if (elapsed <= this.pushRise) {
                // плавный подъём (easeInQuad)
                const u = Math.min(1, elapsed / Math.max(1e-6, this.pushRise));
                a = u * u;
            } else {
                // мягкий отпуск (easeOutQuad)
                const u = Math.min(1, (elapsed - this.pushRise) / Math.max(1e-6, this.pushRelease));
                a = 1 - u * u;
            }

            this.tmp.set(this.pushAcc).multiplyScalar(a);
            Vec3.scaleAndAdd(this.extraVel, this.extraVel, this.tmp, dt);

            this.pushTimer -= dt;
            if (this.pushTimer <= 0) {
                this.pushTimer = 0;
                this.pushAcc.set(0, 0, 0);
            }
        }

        // линейное затухание добавочной скорости
        Vec3.multiplyScalar(this.extraVel, this.extraVel, this.linearDamp);
    }


    // ======= Перемещение =======
    private move(dt: number) {
        const wp = this.node.worldPosition;
        // базовая скорость вперёд
        Vec3.scaleAndAdd(this.nextPos, wp, this.forward, this.currentSpeed * dt);
        // добавочные импульсы
        Vec3.scaleAndAdd(this.nextPos, this.nextPos, this.extraVel, dt);
        this.node.setWorldPosition(this.nextPos);
    }

    // ======= Автостабилизация и затухание углов =======
    private stabilize(dt: number) {
        const speedFactor = this.currentSpeed / this.MAX_SPEED;
        const stab = 0.95 + 0.04 * speedFactor;
        this.angImpulse.x *= stab;
        this.angImpulse.z *= stab;
        this.angImpulse.y *= 0.96;
    }

    onPartTriggerEnter(partNode: Node, e: ITriggerEvent) {
        const rLocal = this.worldToLocal(partNode.worldPosition);
        const absX = Math.abs(rLocal.x);
        const absZ = Math.abs(rLocal.z);

        // 0..1: фронтальность удара
        let frontal = Math.min(1, Math.max(0, 1 - (absX / Math.max(0.001, absZ + 0.001))));
        // хотим помягче влияние угла: легкий «кэп»
        frontal = Math.min(frontal, 0.85);
        const lateral = 1 - frontal;

        // масштаб по скорости (стоя на месте не улетаем)
        const speedK = 0.5 + 0.5 * (this.currentSpeed / this.MAX_SPEED); // 0.5..1

        // ⬇️ ключевое: при боковом ударе уменьшаем ОБЩУЮ силу
        // angleK: 0.65 (чисто бок) .. 1.0 (фронт)
        const angleK = 0.65 + 0.35 * frontal;

        // базовая сила + зависимость от реальной скорости
        const baseAcc = this.pushPeak * (0.75 * speedK + 0.25);
        const totalAcc = baseAcc * angleK;

        // распределяем между назад/вбок (угол меняет «куда», но «насколько» — меньше)
        const backShare = 0.55 + 0.25 * frontal; // 0.55..0.80
        const sideShare = 1.0 - backShare;       // 0.20..0.45

        const dirBack = this.forward.clone().multiplyScalar(-1);
        const dirSide = this.right.clone().multiplyScalar(rLocal.x > 0 ? -1 : 1);

        const push = new Vec3();
        Vec3.scaleAndAdd(push, push, dirBack, totalAcc * backShare);
        Vec3.scaleAndAdd(push, push, dirSide, totalAcc * sideShare);
        // вверх НЕ добавляем

        this.applySoftPush(push); // теперь без второго аргумента

        // разворот от стены — оставим ощутимым (можно чуть мягче при фронте)
        if (absX >= this.sideXMin && absZ <= this.frontZMax) {
            const yawSign = (rLocal.x > 0) ? -1 : 1;
            const yawK = 0.7 + 0.3 * lateral; // боковой → сильнее поворачиваем
            this.angImpulse.y += yawSign * this.sideYawGain * speedK * yawK;
        }

        // минимальный крен/тангаж для живости, без «подброса»
        const rWorld = this.tmp.set(partNode.worldPosition).subtract(this.node.worldPosition);
        this.angImpulse.x += rWorld.z * 0.6;
        this.angImpulse.z -= rWorld.x * 0.8;

        // двухфазное замедление (как настроили раньше)
        this.recoverHold = this.slowHoldTime;
        this.recoverTimer = this.slowRecoverTime;
        this.speedMul = Math.min(this.speedMul, this.slowMulOnHit);

        // отстрел детали — без изменений
        if (!(partNode as any).__broken) {
            (partNode as any).__broken = true;

            const planeVel = this.forward.clone().multiplyScalar(this.currentSpeed);
            const impulse = new Vec3(
                (Math.random() * 2 - 1) * 10,
                randomRange(2, 6),
                (Math.random() * 2 - 1) * 10
            );

            const saved = partNode.getWorldPosition();
            partNode.parent = this.node.scene!;
            partNode.setWorldPosition(saved);

            const pp = partNode.getComponent(PartPhysics) ?? partNode.addComponent(PartPhysics);
            pp.init(planeVel, impulse, false);
        }
    };


    // ======= УТИЛИТЫ =======
    private worldToLocal(worldPos: Vec3): Vec3 {
        const rWorld = worldPos.clone().subtract(this.node.worldPosition);
        const inv = new Quat();
        Quat.invert(inv, this.node.getWorldRotation());
        const out = new Vec3();
        Vec3.transformQuat(out, rWorld, inv);
        return out;
    }

    private applySoftPush(accWorld: Vec3) {
        // суммируем импульсы, продлеваем время, но без повторного «удара»
        this.pushAcc.add(accWorld);
        this.pushTimer = Math.max(this.pushTimer, this.pushRise + this.pushRelease);
    }
}
