import {EventKeyboard, EventMouse, Input, input, KeyCode} from 'cc';

import {IOrbitCameraInput} from "db://assets/scripts/core/camera/IOrbitCameraInput";
import {OrbitCamera} from "db://assets/scripts/core/camera/OrbitCamera";

export class OrbitCameraInputMouse implements IOrbitCameraInput {
    private _orbitCamera: OrbitCamera;
    private _clickMouse = false;

    constructor(orbitCamera: OrbitCamera) {
        this._orbitCamera = orbitCamera;
    }

    enable(): void {
        this._addEventListeners();
    }

    disable(): void {
        this._removeEventListeners();
    }

    private _addEventListeners(): void {
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this._onMouseWheel, this);

        input.on(Input.EventType.MOUSE_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.MOUSE_UP, this._onKeyUp, this);
    }

    private _removeEventListeners(): void {
        input.off(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.off(Input.EventType.MOUSE_WHEEL, this._onMouseWheel, this);
    }

    private _onMouseMove(event: EventMouse): void {
        if (this._clickMouse){
            this._orbitCamera.yaw += event.getDeltaX() * (-this._orbitCamera.orbitSensitivity / 2);
            this._orbitCamera.pitch += event.getDeltaY() * (this._orbitCamera.orbitSensitivity / 2);
        }
    }

    private _onMouseWheel(event: EventMouse): void {
        this._orbitCamera.distance -= Math.sign(event.getScrollY());
    }

    private _onKeyDown(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this._clickMouse = true;
        }
    }

    private _onKeyUp(event: EventMouse) {
        if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this._clickMouse = false;
        }
    }
}





























