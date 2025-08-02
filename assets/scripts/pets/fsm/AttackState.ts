import {PetStateBase} from "./PetStateBase";
import {PetState} from "db://assets/scripts/pets/fsm/PetFSM";

export class AttackState extends PetStateBase {
    private _attackTimer = 0;

    enter(): void {
        this._attackTimer = 0;
    }

    update(dt: number): void {
        const block = this.pet.targetBlock;
        if (!block) {
            this.pet.fsm.changeState(PetState.Idle);
            return;
        }

        this._attackTimer += dt;

        if (this._attackTimer >= 1 / this.pet.attacksPerSecond) {
            block.takeDamage(this.pet.damage);
            this._attackTimer = 0;
        }
    }

    exit(): void {
    }
}