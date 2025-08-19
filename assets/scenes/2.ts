import {
    _decorator, Component, Node, Vec3, Quat,
    input, Input, EventKeyboard, KeyCode,
    Collider, ITriggerEvent,
} from 'cc';
import { PartPhysics } from 'db://assets/scenes/PartPhysics';

const { ccclass, property } = _decorator;

@ccclass('PlaneController')
export class PlaneController extends Component {
    // ===== Движение / управление =====
    @property baseSpeed = 50;
    @property boostSpeed = 20;
    @property turnSpeed = 60;        // °/с рысканья от A/D
    @property turnMul = 1.5;         // усиление
    @property maxRoll = 30;          // ° максимум крена
    @property rollSpeed = 90;        // °/с скорость набора крена
    private readonly MAX_SPEED = 170;

    // ===== Отскок =====
    @property({ tooltip: 'Сила одного отскока (условн. м/с²). Каждое столкновение — одинаково.' })
    pushStrength = 6000;
    @property({ tooltip: 'Плавный набор силы (сек)' })
    pushRise = 0.08;
    @property({ tooltip: 'Плавный отпуск силы (сек)' })
    pushFall = 0.16;
    @property({ tooltip: 'Демпфирование добавочной скорости за кадр' })
    linearDamp = 0.9;

    // угол удара: разделение «назад/вбок» и лёгкий поворот от стены
    @property({ tooltip: 'Сколько поворачивать нос при боковом касании (°/с)' })
    sideYawGain = 160;
    @property({ tooltip: 'Порог |X| в лок. коорд. для бокового удара' })
    sideXMin = 0.25;
    @property({ tooltip: 'Макс. |Z|, чтобы не считать фронтом' })
    frontZMax = 1.1;

    // Замедление на удар
    @property({ tooltip: 'Оставшаяся доля целевой скорости при ударе (0.3 = -70%)' })
    slowMulOnHit = 0.30;
    @property({ tooltip: 'Плавное восстановление до 1 (сек)' })
    slowRecoverTime = 6.0;

    // --- input
    private w=false; private a=false; private d=false;

    // --- ориентация/скорость
    private yawDeg = 0;
    private rollDeg = 0;
    private currentSpeed = 0;

    // --- базисы/временные
    private forward = new Vec3();    // world forward
    private right   = new Vec3();    // world right
    private tmp     = new Vec3();
    private nextPos = new Vec3();

    // --- добавочная линейная скорость от отскока
    private extraVel = new Vec3();

    // --- «живой» импульс отскока (ускорение), проигрываем по S-кривой
    private pushAcc   = new Vec3();  // направление и модуль импульса (м/с²)
    private pushTimer = 0;           // оставшееся время импульса (rise + fall)

    // --- анти-накопление: за короткое окно не складываем отскоки (берём последний)
    private impulseLock = 0;         // сек; пока >0, новые удары не суммируются
    private static readonly MERGE_WINDOW = 0.06; // 60 мс — защиты от одновременных срабатываний

    // --- замедление скорости после удара
    private speedMul = 1;            // множитель к целевой скорости
    private recoverT = 0;            // таймер восстановления

    private asd =0;
    // ===== LIFECYCLE =====
    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP,   this.onKeyUp,   this);

        this.asd = this.node.position.y
        console.log(this.asd)
    }
    onDestroy() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP,   this.onKeyUp,   this);
    }

    // ===== INPUT =====
    private onKeyDown(e: EventKeyboard) {
        if (e.keyCode === KeyCode.KEY_W) this.w = true;
        if (e.keyCode === KeyCode.KEY_A) this.a = true;
        if (e.keyCode === KeyCode.KEY_D) this.d = true;
    }
    private onKeyUp(e: EventKeyboard) {
        if (e.keyCode === KeyCode.KEY_W) this.w = false;
        if (e.keyCode === KeyCode.KEY_A) this.a = false;
        if (e.keyCode === KeyCode.KEY_D) this.d = false;
    }

    // ===== UPDATE =====
    update(dt: number) {
        this.updateSpeed(dt);
        this.updateSteer(dt);
        this.updateBasis();
        this.updateBounceImpulse(dt);
        this.move(dt);

        if (this.impulseLock > 0) this.impulseLock -= dt;

        if (this.asd !=this.node.position.y){
            console.log(this.node.position.y)
        }
    }

    // --- скорость и плавное восстановление после удара
    private updateSpeed(dt: number) {
        let target = this.baseSpeed + (this.w ? this.boostSpeed : 0);
        if (target > this.MAX_SPEED) target = this.MAX_SPEED;

        if (this.recoverT > 0) {
            this.recoverT = Math.max(0, this.recoverT - dt);
            const t = 1 - (this.recoverT / this.slowRecoverTime); // 0..1
            const s = t*t*(3 - 2*t);                              // smoothstep
            this.speedMul = this.slowMulOnHit + (1 - this.slowMulOnHit)*s;
        } else {
            this.speedMul = 1;
        }
        this.currentSpeed = target * this.speedMul;
    }

    // --- повороты (ввод + лёгкий демпф крена)
    private updateSteer(dt: number) {
        if (this.a) this.yawDeg += this.turnSpeed * this.turnMul * dt;
        if (this.d) this.yawDeg -= this.turnSpeed * this.turnMul * dt;

        let targetRoll = 0;
        if (this.a) targetRoll = this.maxRoll;
        if (this.d) targetRoll =-this.maxRoll;

        // вывод крена к таргету
        if (this.rollDeg < targetRoll) this.rollDeg = Math.min(this.rollDeg + this.rollSpeed*dt, targetRoll);
        else if (this.rollDeg > targetRoll) this.rollDeg = Math.max(this.rollDeg - this.rollSpeed*dt, targetRoll);

        this.node.setRotationFromEuler(0, this.yawDeg, this.rollDeg);
    }

    // --- пересчёт forward/right
    private updateBasis() {
        const rot = this.node.getWorldRotation();
        Vec3.transformQuat(this.forward, new Vec3(0,0,-1), rot); this.forward.normalize();
        Vec3.transformQuat(this.right,   new Vec3(1,0, 0), rot); this.right.normalize();
    }

    // --- проигрываем S-кривую импульса: плавный подъём → плавный отпуск
    private updateBounceImpulse(dt: number) {
        if (this.pushTimer > 0) {
            const total = this.pushRise + this.pushFall;
            const elapsed = total - this.pushTimer;
            let amp = 0; // 0..1

            if (elapsed <= this.pushRise) {
                const u = Math.min(1, elapsed / Math.max(1e-6, this.pushRise)); // easeInQuad
                amp = u*u;
            } else {
                const u = Math.min(1, (elapsed - this.pushRise) / Math.max(1e-6, this.pushFall)); // easeOutQuad
                amp = 1 - u*u;
            }

            // v += a(t) * A * dt
            this.tmp.set(this.pushAcc).multiplyScalar(amp);
            Vec3.scaleAndAdd(this.extraVel, this.extraVel, this.tmp, dt);

            this.pushTimer -= dt;
            if (this.pushTimer <= 0) {
                this.pushTimer = 0;
                this.pushAcc.set(0,0,0);
            }
        }

        // затухание добавочной скорости
        Vec3.multiplyScalar(this.extraVel, this.extraVel, this.linearDamp);
    }

    // --- перемещение
    // private move(dt: number) {
    //     const p = this.node.worldPosition;
    //     Vec3.scaleAndAdd(this.nextPos, p, this.forward, this.currentSpeed * dt); // тяга
    //     Vec3.scaleAndAdd(this.nextPos, this.nextPos, this.extraVel, dt);         // отскок
    //     this.node.setWorldPosition(this.nextPos);
    // }

    private move(dt: number) {
        const p = this.node.worldPosition;

        // если идёт отскок — запрещаем вертикаль у направлений
        if (this.isBouncing()) {
            if (this.forward.y !== 0) this.forward.y = 0;    // не даём forward тянуть по Y
            if (this.extraVel.y !== 0) this.extraVel.y = 0;  // и добавочной скорости тоже
        }

        // тяга
        Vec3.scaleAndAdd(this.nextPos, p, this.forward, this.currentSpeed * dt);
        // импульс отскока
        Vec3.scaleAndAdd(this.nextPos, this.nextPos, this.extraVel, dt);

        // во время отскока фиксируем текущую высоту,
        // чтобы не было скачка от крена/комбинации осей
        if (this.isBouncing()) this.nextPos.y = p.y;

        this.node.setWorldPosition(this.nextPos);
    }


    // ===== УДАР О ДЕТАЛЬ =====
    onPartTriggerEnter  (partNode: Node, _e: ITriggerEvent)  {
        // 1) локальная точка удара: X — право(+)/лево(–), Z — вперёд(–)
        const rLocal = this.worldToLocal(partNode.worldPosition);
        const absX = Math.abs(rLocal.x), absZ = Math.abs(rLocal.z);

        // 2) фронтальность 0..1 (0 — чисто бок, 1 — фронт). Величина отскока НЕ меняется!
        const frontal = Math.min(1, Math.max(0, 1 - (absX / Math.max(0.001, absZ + 0.001))));
        // только направление делим, не силу:
        const backShare = 0.55 + 0.25 * frontal; // 0.55..0.80 — доля «назад»
        const sideShare = 1.0 - backShare;       // 0.20..0.45 — доля «вбок»

        // 3) формируем импульс СТРОГО в XZ (никакого вверх)
        const dirBack = this.forward.clone().multiplyScalar(-1);
        const dirSide = this.right.clone().multiplyScalar(rLocal.x > 0 ? -1 : 1);
        const push = new Vec3();
        Vec3.scaleAndAdd(push, push, dirBack, this.pushStrength * backShare);
        Vec3.scaleAndAdd(push, push, dirSide, this.pushStrength * sideShare);

        // 4) применяем импульс: один «пинок» на событие, без суммирования
        this.applyBounce(push);

        // 5) поворот носа от стены (только yaw; без roll/pitch, чтобы не «подбрасывало»)
        if (absX >= this.sideXMin && absZ <= this.frontZMax) {
            const yawSign = (rLocal.x > 0) ? -1 : 1; // удар справа → нос вправо (от стены)
            this.yawDeg += yawSign * this.sideYawGain * 0.016; // короткий импульс (~1 кадр при 60fps)
        }

        // 6) замедляем скорость и запускаем плавное восстановление
        this.recoverT = this.slowRecoverTime;
        this.speedMul = Math.min(this.speedMul, this.slowMulOnHit);

        // 7) отстрел детали — по желанию оставим как визуальный эффект
        if (!(partNode as any).__broken) {
            (partNode as any).__broken = true;

            const planeVel = this.forward.clone().multiplyScalar(this.currentSpeed);
            const saved = partNode.getWorldPosition();
            partNode.parent = this.node.scene!;
            partNode.setWorldPosition(saved);

            const pp = partNode.getComponent(PartPhysics) ?? partNode.addComponent(PartPhysics);
            // лёгкий разлёт в стороны, БЕЗ вертикали (y=0), чтобы не мешать восприятию отскока
            const debrisImpulse = new Vec3((Math.random()*2-1)*8, 0, (Math.random()*2-1)*8);
            pp.init(planeVel, debrisImpulse, false);
        }
    };

    // ===== УТИЛИТЫ =====
    private worldToLocal(worldPos: Vec3): Vec3 {
        const rWorld = worldPos.clone().subtract(this.node.worldPosition);
        const inv = new Quat();
        Quat.invert(inv, this.node.getWorldRotation());
        const out = new Vec3();
        Vec3.transformQuat(out, rWorld, inv);
        return out;
    }

    private applyBounce(accWorld: Vec3) {
        const total = this.pushRise + this.pushFall;

        // за короткое окно НЕ суммируем удары (берём последний, чтобы «2 и 3 одновременно» не усиливали)
        if (this.impulseLock <= 0) {
            this.impulseLock = PlaneController.MERGE_WINDOW;
        }
        // всегда заменяем текущий импульс на новый (одинаковый по силе каждый раз)
        this.pushAcc.set(accWorld);
        this.pushTimer = total;
    }

    private isBouncing(): boolean {
        return this.pushTimer > 0 || this.impulseLock > 0;
    }
}
