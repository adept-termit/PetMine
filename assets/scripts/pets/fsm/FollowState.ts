import { PetStateBase } from "./PetStateBase";
import { Vec3, Quat } from "cc";

export class FollowState extends PetStateBase {
    enter(): void { }
    exit(): void { }

    update(dt: number): void {
        const character = this.pet.characterNode;
        if (!character) return;

        const characterWorldPos = character.getWorldPosition();
        const characterWorldRot = character.getWorldRotation();
        const rotatedOffset = new Vec3();
        Vec3.transformQuat(rotatedOffset, this.pet.followOffset, characterWorldRot);

        const targetPos = new Vec3();
        Vec3.add(targetPos, characterWorldPos, rotatedOffset);
        targetPos.y = this.pet.node.worldPosition.y;

        const currentPos = this.pet.node.getWorldPosition();
        const distance = Vec3.distance(currentPos, targetPos);

        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, currentPos);
        direction.normalize();
        const targetRot = new Quat();
        Quat.fromViewUp(targetRot, direction, Vec3.UP);

        const smoothRot = new Quat();
        Quat.rotateTowards(smoothRot, this.pet.node.getWorldRotation(), targetRot, 360 * dt);

        const smoothPos = new Vec3();
        const lerpSpeed = 2 + distance * 3;
        Vec3.lerp(smoothPos, currentPos, targetPos, dt * lerpSpeed);
        smoothPos.y = currentPos.y;
        this.pet.node.setWorldPosition(smoothPos);
        this.pet.node.setWorldRotation(smoothRot);
    }
}
