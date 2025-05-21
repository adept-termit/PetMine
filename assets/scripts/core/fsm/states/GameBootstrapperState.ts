import {director, Scene} from 'cc';

import {IState} from "db://assets/scripts/core/fsm/IState";
import {EnumGameState, GameManager} from "db://assets/scripts/core/fsm/GameManager";
import {gameLocalStorage} from "db://assets/scripts/core/storage/LocalStorage";
import {EMPTY_PLAYER_PROGRESS} from "db://assets/scripts/core/storage/TPlayerProgress";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";

export class GameBootstrapperState implements IState {
    private gameManager: GameManager;
    private scene: Scene;

    constructor(game: GameManager) {
        this.gameManager = game;
        this.scene = director.getScene();
    }

    async onEnter() {
        this.loadSaves();


        this.gameManager.stateMachine.changeState(EnumGameState.Menu);
    }

    public onExit() {
    }

    /*
    * Загружаем сохранения
    * */
    private loadSaves() {
        const saves = gameLocalStorage.load();

        if (saves) {
            playerProgress.setProgress(saves);
            return;
        }

        gameLocalStorage.save(EMPTY_PLAYER_PROGRESS);
        this.gameManager.newGame = true;
        playerProgress.setProgress(EMPTY_PLAYER_PROGRESS);
    }
}
