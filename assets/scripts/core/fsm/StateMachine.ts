import {EnumGameState} from "db://assets/scripts/core/fsm/GameManager";
import {IState} from "db://assets/scripts/core/fsm/IState";

export class StateMachine {
    private _statesMap = new Map<EnumGameState, IState>;
    private _currentState: IState;

    public addState(stateId: EnumGameState, state: IState): void {
        this._statesMap.set(stateId, state);
    }

    public changeState(stateId: EnumGameState): void {
        if (this._currentState && this._currentState.onExit) {
            this._currentState.onExit();
        }

        const newState = this._statesMap.get(stateId);
        this._currentState = newState;

        newState.onEnter();
    }

    get currentState(): IState {
        return this._currentState;
    }
}
