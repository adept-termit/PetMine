import {StateMachine} from "db://assets/scripts/core/fsm/StateMachine";
import {GameBootstrapperState} from "db://assets/scripts/core/fsm/states/GameBootstrapperState";
import {MenuState} from "db://assets/scripts/core/fsm/states/MenuState";
import {TPlayerProgress} from "db://assets/scripts/core/storage/TPlayerProgress";
import {LoadGame} from "db://assets/scripts/core/fsm/states/LoadGame";
import {Camera, Node} from "cc";
import {Character} from "db://assets/scripts/character/Character";

export enum EnumGameState {
    GameBootstrapper,
    Menu,
    LoadGame,
}

export class GameManager {
    private _stateMachine: StateMachine;
    private _newGame: boolean = false;

    cameraNode: Node;
    character: Character;

    init() {
        this._createStateMachine();

        this.stateMachine.changeState(EnumGameState.GameBootstrapper);
    }

    private _createStateMachine() {
        this._stateMachine = new StateMachine();

        this._stateMachine.addState(EnumGameState.GameBootstrapper, new GameBootstrapperState(this));
        this._stateMachine.addState(EnumGameState.Menu, new MenuState(this));
        this._stateMachine.addState(EnumGameState.LoadGame, new LoadGame(this));
    }

    get stateMachine(): StateMachine {
        return this._stateMachine;
    }

    get newGame(): boolean {
        return this._newGame;
    }

    set newGame(value: boolean) {
        this._newGame = value;
    }
}

export const gameManager = new GameManager();