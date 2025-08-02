import {PetStateBase} from "db://assets/scripts/pets/fsm/PetStateBase";
import {Pet} from "db://assets/scripts/pets/Pet";
import {IdleState} from "db://assets/scripts/pets/fsm/IdleState";
import {MoveState} from "db://assets/scripts/pets/fsm/MoveState";
import {FollowState} from "db://assets/scripts/pets/fsm/FollowState";
import {AttackState} from "db://assets/scripts/pets/fsm/AttackState";

export const enum PetState {
    Idle,
    FollowToCharacter,
    MoveToTarget,
    AttackTarget
}

export class PetFSM {
    private _states: Map<number, PetStateBase> = new Map();
    private _currentState: PetStateBase | null = null;

    constructor(pet: Pet) {
        this._states.set(PetState.Idle, new IdleState(pet));
        this._states.set(PetState.MoveToTarget, new MoveState(pet));
        this._states.set(PetState.FollowToCharacter, new FollowState(pet));
        this._states.set(PetState.AttackTarget, new AttackState(pet));
    }

    update(dt: number): void {
        this._currentState?.update(dt);
    }

    changeState(stateId: number): void {
        this._currentState?.exit();

        this._currentState = this._states.get(stateId);
        this._currentState.enter();
    }
}