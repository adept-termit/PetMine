import {StateMachine} from "db://assets/scripts/core/fsm/StateMachine";
import {GameBootstrapperState} from "db://assets/scripts/core/fsm/states/GameBootstrapperState";
import {MenuState} from "db://assets/scripts/core/fsm/states/MenuState";
import {TPlayerProgress} from "db://assets/scripts/core/storage/TPlayerProgress";

export enum EnumGameState {
    GameBootstrapper,
    Menu,
}

export class GameManager {
    private _playerProgress: TPlayerProgress;
    private _stateMachine: StateMachine;
    private _newGame: boolean = false;

    init() {
        this._createStateMachine();

        this.stateMachine.changeState(EnumGameState.GameBootstrapper);
    }

    private _createStateMachine() {
        this._stateMachine = new StateMachine();

        this._stateMachine.addState(EnumGameState.GameBootstrapper, new GameBootstrapperState(this));
        this._stateMachine.addState(EnumGameState.Menu, new MenuState(this));
        // this._stateMachine.addState(EnumGameState.Game, new Game(this));
    }

    get stateMachine(): StateMachine {
        return this._stateMachine;
    }

    get playerProgress(): TPlayerProgress {
        return this._playerProgress;
    }

    set playerProgress(value: TPlayerProgress) {
        this._playerProgress = value;
    }

    get newGame(): boolean {
        return this._newGame;
    }

    set newGame(value: boolean) {
        this._newGame = value;
    }
}

export const gameManager = new GameManager();