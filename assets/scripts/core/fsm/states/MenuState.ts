import {IState} from "db://assets/scripts/core/fsm/IState";
import {GameManager} from "db://assets/scripts/core/fsm/GameManager";

export class MenuState implements IState {
    private gameManager: GameManager;

    constructor(game: GameManager) {
        this.gameManager = game;
    }

    async onEnter() {
        console.log(123)
    }

    public onExit() {
    }
}