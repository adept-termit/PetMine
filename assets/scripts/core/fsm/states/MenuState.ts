import {IState} from "db://assets/scripts/core/fsm/IState";
import {EnumGameState, GameManager} from "db://assets/scripts/core/fsm/GameManager";

export class MenuState implements IState {
    private gameManager: GameManager;

    constructor(game: GameManager) {
        this.gameManager = game;
    }

    async onEnter() {
        this.gameManager.stateMachine.changeState(EnumGameState.LoadGame);
    }

    public onExit() {
    }
}