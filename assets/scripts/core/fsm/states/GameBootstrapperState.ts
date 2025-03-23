import { director, Scene } from 'cc';

import {IState} from "db://assets/scripts/core/fsm/IState";
import {EnumGameState, GameManager} from "db://assets/scripts/core/fsm/GameManager";
import {gameLocalStorage} from "db://assets/scripts/core/storage/LocalStorage";
import {EMPTY_PLAYER_PROGRESS} from "db://assets/scripts/core/storage/TPlayerProgress";
import {loadAndInstantiatePrefab} from "db://assets/scripts/core/utils/ResourcesLoader";

export class GameBootstrapperState implements IState {
    private gameManager: GameManager;
    private scene: Scene;

    constructor(game: GameManager) {
        this.gameManager = game;
        this.scene = director.getScene();
    }

    async onEnter() {
        this.loadSaves();

        const camera = await this.instantiateCamera();

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
            this.gameManager.playerProgress = saves;
            return;
        }

        gameLocalStorage.save(EMPTY_PLAYER_PROGRESS);
        this.gameManager.newGame = true;
        this.gameManager.playerProgress = EMPTY_PLAYER_PROGRESS;
    }

    private async instantiateCamera(): Promise<OrbitCamera> {
        const cameraNode = await loadAndInstantiatePrefab('character/playerCamera');

        return cameraNode.getComponent(OrbitCamera);
    }



}
