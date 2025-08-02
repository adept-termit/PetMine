import { PetStateBase } from './PetStateBase';
import {blockProvider} from "db://assets/scripts/biomes/BlockProvider";
import {PetState} from "db://assets/scripts/pets/fsm/PetFSM";

export class IdleState extends PetStateBase {
    enter(): void {
        const freeBlock = blockProvider.getFreeBlock();

        if (!freeBlock) {
            this.pet.fsm.changeState(0);
            return;
        }

        this.pet.setTargetBlock(freeBlock);
        this.pet.fsm.changeState(PetState.MoveToTarget);
    }

    update(dt: number): void {

    }
}