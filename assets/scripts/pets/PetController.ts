import {_decorator, Component, Node, Vec3} from 'cc';

import {eventService} from "db://assets/scripts/core/utils/EventService";
import {TakeDamageController} from "db://assets/scripts/biomes/block/TakeDamageController";

const {ccclass, property} = _decorator;

@ccclass('PetController')
export class PetController extends Component {
    @property({tooltip: "Наносимый урон"}) damage: number = 10;
    @property({tooltip: "Скорость движения питомца"}) speed: number = 5;

    private _localPosInPetsRoot: Vec3 = null;

    // Текущий блок-цель
    private _target: Node = null;

    // Мировая позиция, к которой движется питомец
    private _targetPosition: Vec3 = null;

    // Локальная позиция, для поиска нужной ноды при удалении
    private _targetLocalPosition: Vec3 = null;

    // Флаг достижения цели
    private _reachedTarget: boolean = false;

    // Время между атаками (сек)
    private _attackCooldown: number = 0.3;

    // Таймер времени с момента последней атаки
    private _attackTimer: number = 0;

    // Геттер и сеттер цели
    get target(): Node | null {
        return this._target;
    }

    set target(value: Node | null) {
        this._target = value;
        this._reachedTarget = false;
        this._attackTimer = 0;

        if (value) {
            this._targetPosition = value.getWorldPosition().clone().add(new Vec3(0, 1, 0));
            this._targetLocalPosition = this._target.getPosition().clone();

            const takeDamageController = this._target.getComponent(TakeDamageController);
            takeDamageController?.checkHit();
        }
    }

    get localPosInPetsRoot(): Vec3 {
        return this._localPosInPetsRoot;
    }

    set localPosInPetsRoot(value: Vec3) {
        this._localPosInPetsRoot = value;
    }

// Подписка на события
    onEnable() {
        eventService.eventEmitter.on('DELETE_TARGET_FROM_PET', this.clearTarget, this);
    }

    // Отписка от событий
    onDisable() {
        eventService.eventEmitter.off('DELETE_TARGET_FROM_PET', this.clearTarget, this);
    }

    update(dt: number) {
        if (!this._target || !this._targetPosition) return;

        this.moveTowardsTarget(dt);

        if (!this._reachedTarget) return;

        this.tryAttack(dt);
    }

    /**
     * Двигает питомца к цели плавно с использованием Vec3.lerp
     */
    private moveTowardsTarget(dt: number) {
        const currentPos = this.node.getWorldPosition();
        const newPos = new Vec3();

        Vec3.lerp(newPos, currentPos, this._targetPosition, dt * this.speed);
        this.node.setWorldPosition(newPos);

        // Установка флага при достижении цели
        if (!this._reachedTarget && Vec3.distance(newPos, this._targetPosition) < 0.1) {
            this._reachedTarget = true;
        }
    }

    /**
     * Если цель достигнута — наносит урон блоку по таймеру
     */
    private tryAttack(dt: number) {
        this._attackTimer += dt;
        if (this._attackTimer < this._attackCooldown) return;

        this._attackTimer = 0;

        const takeDamageController = this._target.getComponent(TakeDamageController);
        takeDamageController?.applyDamageToBlock(this.damage);
    }

    /**
     * Сброс текущей цели (например, при уничтожении блока)
     */
    private clearTarget(node: Node) {

        console.log(this._targetLocalPosition)
        if (node.getPosition().toString() === this._targetLocalPosition.toString()) {
            this._target = null;
            this._targetLocalPosition = null;
            this._targetPosition = null;
            this._reachedTarget = false;
        }

    }
}