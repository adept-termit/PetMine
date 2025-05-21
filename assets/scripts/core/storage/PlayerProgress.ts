import {_decorator, Component, Node} from 'cc';
import {TPlayerProgress, TSelected} from "db://assets/scripts/core/storage/TPlayerProgress";

const {ccclass, property} = _decorator;

export class PlayerProgress {
    private _progress: TPlayerProgress;

    get selectedCharacterCustomization(): TSelected {
        return this._progress.selected;
    }

    setProgress(saves: TPlayerProgress) {
        this._progress = saves;
    }

    get progress(): TPlayerProgress {
        return this._progress;
    }
}

export const playerProgress = new PlayerProgress();