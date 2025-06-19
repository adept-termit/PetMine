import {Node, Vec3, Quat} from 'cc';
import {PetController} from "db://assets/scripts/pets/PetController";

const petHeightOffset = 0.5;
const minDistance = 0.5;
const followSpeed = 10; // единиц в секунду

export class PetFollowerSystem {
    private _elapsed = 0; // для ускоренного догона

    constructor(private petsRoot: Node, private target: Node) {
        // Устанавливаем локальные позиции питомцев
        this.petsRoot.children.forEach(petNode => {
            petNode.setPosition(petNode.getComponent(PetController).localPosInPetsRoot);
        });
    }

    update(dt: number) {
        if (!this.target || !this.petsRoot) return;

        const currentPos = this.petsRoot.getWorldPosition();
        const targetPos = this.target.getWorldPosition().clone();
        targetPos.y += petHeightOffset;

        const distance = Vec3.distance(currentPos, targetPos);

        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, currentPos);
        direction.normalize();

        const targetRotation = new Quat();
        Quat.fromViewUp(targetRotation, direction, Vec3.UP);

        const smoothedRotation = new Quat();
        Quat.rotateTowards(smoothedRotation, this.petsRoot.getWorldRotation(), targetRotation, 720 * dt);

        const smoothedPosition = new Vec3();
        console.log('Distance to target:', distance);
        // Ускоренный догон первые 0.3 секунды
        const speedFactor = this._elapsed < 0.3 ? 10 : 2;

        if (distance > minDistance) {
            Vec3.moveTowards(smoothedPosition, currentPos, targetPos, speedFactor * dt);
        } else {
            smoothedPosition.set(currentPos);
        }

        this.petsRoot.setWorldRotation(smoothedRotation);
        this.petsRoot.setWorldPosition(smoothedPosition);

        this._elapsed += dt;
    }
}
