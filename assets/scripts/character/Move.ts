import {
    _decorator,
    CCFloat,
    CharacterController,
    Component, Node,
    toDegree,
    Vec3
} from 'cc';
import {Animator} from "db://assets/scripts/character/Animator";
import {gameInput} from "db://assets/scripts/core/Input/GameInput";
import {smoothDampAngle} from "db://assets/scripts/core/utils/Math";

const { ccclass, property } = _decorator;

@ccclass('Move')
export class Move extends Component {
    // Параметры передвижения
    @property({type: CCFloat}) movementSpeed: number = 10; // Скорость движения персонажа
    @property({type: CCFloat}) gravity: number = -30; // Гравитация
    @property({type: CCFloat}) turnSmoothTime: number = 0.1; // Время сглаживания поворота
    @property({type: CCFloat}) jumpForce: number = 10; // Сила прыжка

    private camera: Node;
    private _characterController: CharacterController; // Контроллер персонажа
    private _animator: Animator; // Аниматор для управления анимациями

    private _input: Vec3 = new Vec3(); // Вектор ввода
    private _movement: Vec3 = new Vec3(); // Вектор движения
    private _velocity: Vec3 = new Vec3(); // Вектор скорости

    private _cameraForward = new Vec3(); // Вектор направления камеры вперёд
    private _cameraRight = new Vec3(); // Вектор направления камеры вправо

    private _turnSmoothVelocity = {value: 0}; // Переменная для сглаживания поворота

    private _isMoving: boolean = false; // Флаг движения персонажа
    private _canJump: boolean = false; // Флаг возможности прыжка
    private _scheduleJump: number = 0; // Время ожидания прыжка

    start(): void {
        // Получаем компоненты
        this._characterController = this.getComponent(CharacterController);
        this._animator = this.getComponent(Animator);
    }

    update(dt: number): void {
        // Проверяем возможность прыжка после задержки
        if (this._scheduleJump > 0.5) {
            this._canJump = true;
        }
        this._scheduleJump += dt;

        // Обновляем гравитацию
        this._updateGravity(dt);

        // Проверяем, был ли нажат прыжок
        if (gameInput.isJumpPressed) {
            this._jump();
        }

        // Обрабатываем ввод пользователя
        this._applyInput();

        // Если персонаж двигается, поворачиваем его в нужную сторону
        if (this._isMoving) {
            this._rotateCharacterTo(this._input, dt);
        }

        // Перемещаем персонажа
        this._move(dt);
    }

    private _updateGravity(dt: number) {
        // Обновление гравитации и состояния анимации
        if (this._characterController.isGrounded) {
            this._velocity.set(0, 0, 0);
            this._animator.setJump(false);
        } else {
            const isFalling = this._velocity.y < 0;
            this._animator.setFall(isFalling);
            this._velocity.y += this.gravity * dt;
        }
    }

    private _jump(): void {
        // Проверяем возможность прыжка
        if (!this._canJump || !this._characterController.isGrounded) return;

        // Применяем силу прыжка
        this._velocity.y = this.jumpForce;
        this._scheduleJump = 0;
        this._canJump = false;

        // Включаем анимацию прыжка
        this._animator.setJump(true);
    }

    private _applyInput() {
        // Получаем вектор ввода
        gameInput.getMovementVector(this._input);

        // Определяем, двигается ли персонаж
        this._isMoving = this._input.x !== 0 || this._input.z !== 0;

        if (this._isMoving) {
            // Включаем анимацию ходьбы
            this._animator.setWalk(true);
            this._input.normalize();



            // Получаем направление камеры
            this._cameraForward.set(this.camera.forward);
            this._cameraRight.set(this.camera.right);

            // Убираем влияние по оси Y
            this._cameraForward.y = 0;
            this._cameraRight.y = 0;

            // Нормализуем направления
            this._cameraForward.normalize();
            this._cameraRight.normalize();

            // Применяем относительное движение
            const forwardRelative = this._cameraForward.multiplyScalar(this._input.z);
            const rightRelative = this._cameraRight.multiplyScalar(this._input.x);
            this._input.set(forwardRelative).add(rightRelative);

            return;
        }

        // Отключаем анимацию ходьбы, если персонаж не двигается
        this._animator.setWalk(false);
    }

    private _move(dt: number) {
        // Рассчитываем перемещение персонажа
        let speed = this.movementSpeed;
        this._movement.set(this._input).multiplyScalar(speed * dt);
        this._characterController.move(this._movement);

        // Обрабатываем движение по вертикали (гравитация, прыжок)
        if (this._velocity.lengthSqr() > 0) {
            const velocity = this._velocity.clone().multiplyScalar(dt);
            this._characterController.move(velocity);
        }
    }

    private _rotateCharacterTo(direction: Vec3, dt: number) {
        // Получаем текущий угол поворота персонажа
        const currentRotation = this.node.eulerAngles.y % 360;
        const turnSmoothTime = this.turnSmoothTime;

        // Определяем целевой угол поворота
        const targetRotation = toDegree(Math.atan2(direction.x, direction.z));

        // Применяем сглаженный поворот
        const resultRotation = smoothDampAngle(currentRotation, targetRotation, this._turnSmoothVelocity, turnSmoothTime, dt);

        // Устанавливаем новый угол поворота
        this.node.setRotationFromEuler(0, resultRotation);
    }

    setCamera(cameraNode: Node) {
        this.camera = cameraNode;
    }
}
