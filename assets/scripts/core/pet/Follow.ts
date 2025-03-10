import {_decorator, Component, Node, Vec3, Quat} from 'cc';

const {ccclass, property} = _decorator;

// Создаем временные векторы и кватернион
const tempVec3 = new Vec3();
const tempQuat = new Quat();

const petHeightOffset = 0.5; // Высота, на которой будет летать питомец
const minDistance = 0.5; // Минимальная дистанция до персонажа

@ccclass('Follow')
export class Follow extends Component {
    @property(Node) target: Node; // Цель, за которой следует питомец (персонаж)

    update(dt: number) {
        const currentPos: Vec3 = this.node.worldPosition;   // Получаем текущую позицию питомца

        // Получаем позицию персонажа и поднимаем цель на petHeightOffset
        let targetPos: Vec3 = this.target.worldPosition.clone();
        targetPos.y = targetPos.y + petHeightOffset;

        const distance = Vec3.distance(currentPos, targetPos); // Вычисляем расстояние между питомцем и персонажем
        const direction: Vec3 = tempVec3.set(currentPos).subtract(targetPos).normalize(); // Определяем направление к цели
        const targetRotation = Quat.fromViewUp(tempQuat, direction); // Рассчитываем желаемый поворот питомца в сторону цели

        Quat.rotateTowards(tempQuat, this.node.rotation, targetRotation, 720 * dt); // Плавно поворачиваем питомца в сторону цели со скоростью 720 градусов в секунду

        // Если питомец находится дальше минимальной дистанции, двигаемся к цели
        if (distance > minDistance) {
            Vec3.lerp(tempVec3, currentPos, targetPos, 2 * dt); // Плавное приближение к цели
        } else {
            tempVec3.set(currentPos); // Останавливаемся
        }

        this.node.setRTS(tempQuat, tempVec3); // Устанавливаем новую позицию и поворот питомца
    }
}
