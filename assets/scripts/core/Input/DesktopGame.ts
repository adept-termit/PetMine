import {EventKeyboard, EventMouse, EventTouch, Input, input, KeyCode, sys} from "cc";

import {IInput} from "db://assets/scripts/core/Input/IInput";
import {TInputMap} from "db://assets/scripts/core/Input/GameInput";
import {eventService} from "db://assets/scripts/core/utils/EventService";

export class DesktopGame implements IInput {

    private _inputMap: TInputMap;

    constructor(inputMap: TInputMap) {
        this._inputMap = inputMap;
    }

    enable(): void {
        this.addInputEventListeners();
    }

    disable(): void {
        this.removeInputEventListeners();
    }

    private addInputEventListeners(): void {
        //ввод с клавиатуры
        input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this._onKeyUp, this);

        //ввод с мышки
        input.on(Input.EventType.MOUSE_DOWN, this._onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this._onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
    }

    private removeInputEventListeners(): void {
        //ввод с клавиатуры
        input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this._onKeyUp, this);

        //ввод с мышки
        input.off(Input.EventType.MOUSE_DOWN, this._onMouseDown, this);
        input.off(Input.EventType.MOUSE_UP, this._onMouseUp, this);
        input.off(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
    }

    private _onMouseDown(event: EventMouse) {
        if (event.getButton() == EventMouse.BUTTON_LEFT) this._inputMap.leftMouse = true;
    }

    private _onMouseUp(event: EventMouse) {
        if (event.getButton() == EventMouse.BUTTON_LEFT) this._inputMap.leftMouse = false;
    }

    private _onMouseMove(event: EventMouse) {
        event.getLocation(this._inputMap.mouseMove)
    }

    private _onKeyDown(kbEvent: EventKeyboard) {
        const keyInput = kbEvent.keyCode;

        if (keyInput === KeyCode.KEY_W) this._inputMap.forward = true;
        if (keyInput === KeyCode.KEY_D) this._inputMap.right = true;
        if (keyInput === KeyCode.KEY_S) this._inputMap.back = true;
        if (keyInput === KeyCode.KEY_A) this._inputMap.left = true;
        if (keyInput === KeyCode.SPACE) this._inputMap.jump = true;
    }

    private _onKeyUp(kbEvent: EventKeyboard) {
        const keyInput = kbEvent.keyCode;

        if (keyInput === KeyCode.KEY_W) this._inputMap.forward = false;
        if (keyInput === KeyCode.KEY_D) this._inputMap.right = false;
        if (keyInput === KeyCode.KEY_S) this._inputMap.back = false;
        if (keyInput === KeyCode.KEY_A) this._inputMap.left = false;
        if (keyInput === KeyCode.SPACE) this._inputMap.jump = false;
    }
}
