import {PetStateBase} from "./PetStateBase";
import {Vec3} from "cc";
import {PetState} from "db://assets/scripts/pets/fsm/PetFSM";

const OFFSET = new Vec3(0, 1.5, 0);

export class MoveState extends PetStateBase {

    private _reachedTarget: boolean = false;

    enter() {
        this._reachedTarget = false;

    }

    update(dt: number): void {
        const target = this.pet.targetBlock;
        if (!target) {
            this.pet.fsm.changeState(PetState.Idle);
            return;
        }

        const targetPos = target.node.getWorldPosition().clone().add(OFFSET);
        const currentPos = this.pet.node.getWorldPosition();
        const newPos = new Vec3();
        Vec3.lerp(newPos, currentPos, targetPos, dt * this.pet.moveSpeed);
        this.pet.node.setWorldPosition(newPos);

        if (!this._reachedTarget && Vec3.distance(newPos, targetPos) < 0.1) {
            this._reachedTarget = true;
            this.pet.fsm.changeState(PetState.AttackTarget);
        }
    }
}
