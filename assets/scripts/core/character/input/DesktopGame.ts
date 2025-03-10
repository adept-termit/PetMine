import {EventKeyboard, Input, input, KeyCode} from "cc";

import {IInput} from "db://assets/scripts/core/character/input/IInput";
import {TInputMap} from "db://assets/scripts/core/character/input/TInputMap";

export class DesktopGame implements IInput {

    private _inputMap: TInputMap;

    constructor(inputMap: TInputMap) {
        this._inputMap = inputMap;
    }

    enable(): void {
        this._addEventListeners();
    }

    disable(): void {
        this._removeEventListeners();
    }

    private _addEventListeners(): void {
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _removeEventListeners(): void {
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
    }

    private _onKeyDown(kbEvent: EventKeyboard) {
        const keyInput = kbEvent.keyCode;

        if (keyInput === KeyCode.KEY_W || keyInput === KeyCode.ARROW_UP) {
            this._inputMap.forward = true;
        }

        if (keyInput === KeyCode.KEY_D || keyInput === KeyCode.ARROW_RIGHT) {
            this._inputMap.right = true;
        }

        if (keyInput === KeyCode.KEY_S || keyInput === KeyCode.ARROW_DOWN) {
            this._inputMap.back = true;
        }

        if (keyInput === KeyCode.KEY_A || keyInput === KeyCode.ARROW_LEFT) {
            this._inputMap.left = true;
        }

        if (keyInput === KeyCode.SPACE) {
            this._inputMap.jump = true;
        }
    }

    private _onKeyUp(kbEvent: EventKeyboard) {
        const keyInput = kbEvent.keyCode;

        if (keyInput === KeyCode.KEY_W || keyInput === KeyCode.ARROW_UP) {
            this._inputMap.forward = false;
        }

        if (keyInput === KeyCode.KEY_D || keyInput === KeyCode.ARROW_RIGHT) {
            this._inputMap.right = false;
        }

        if (keyInput === KeyCode.KEY_S || keyInput === KeyCode.ARROW_DOWN) {
            this._inputMap.back = false;
        }

        if (keyInput === KeyCode.KEY_A || keyInput === KeyCode.ARROW_LEFT) {
            this._inputMap.left = false;
        }

        if (keyInput === KeyCode.SPACE) {
            this._inputMap.jump = false;
        }
    }
}
