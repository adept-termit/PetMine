import {EventMouse, EventTouch, Input, input} from "cc";
import {orbit} from "db://assets/scripts/camera/orbit";

export class AbstractInput {
    protected _camera: orbit;
    protected _enabled = false;

    constructor(camera: orbit) {
        this._camera = camera;
    }

    set enabled(value: boolean) {
        if (this._enabled === value) return;

        if (value) {
            this._onEnable();
        } else {
            this._onDisable();
        }

        this._enabled = value;
    }

    protected _onEnable() {
    }

    protected _onDisable() {
    }
}

export class Mobile extends AbstractInput {
    private _touchId = -1;
    private _touchStarted = false;


    protected _onEnable() {
        input.on(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.on(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    protected _onDisable() {
        input.off(Input.EventType.TOUCH_START, this._onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this._onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this._onTouchEnd, this);
        input.off(Input.EventType.TOUCH_CANCEL, this._onTouchEnd, this);
    }

    private _onTouchStart(event: EventTouch) {
        this._touchId = event.getID();
        this._touchStarted = true;
    }

    private _onTouchMove(event: EventTouch) {
        if (!this._touchStarted || event.getID() !== this._touchId) return;

        this._camera.yaw += event.getDeltaX() * -this._camera.orbitSensitivity;
        this._camera.pitch += event.getDeltaY() * this._camera.orbitSensitivity;
    }

    private _onTouchEnd(event: EventTouch) {
        if (event.getID() !== this._touchId) return;

        this._touchId = -1;
        this._touchStarted = false;
    }
}

export class Desktop extends AbstractInput {
    private _clickMouse = false;

    protected _onEnable() {
        input.on(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.on(Input.EventType.MOUSE_WHEEL, this._onMouseWheel, this);
        input.on(Input.EventType.MOUSE_DOWN, this._onKeyDown, this);
        input.on(Input.EventType.MOUSE_UP, this._onKeyUp, this);
    }

    protected _onDisable() {
        input.off(Input.EventType.MOUSE_MOVE, this._onMouseMove, this);
        input.off(Input.EventType.MOUSE_WHEEL, this._onMouseWheel, this);
        input.off(Input.EventType.MOUSE_DOWN, this._onKeyDown, this);
        input.off(Input.EventType.MOUSE_UP, this._onKeyUp, this);
    }

    private _onMouseMove(event: EventMouse) {
        if (this._clickMouse) {
            this._camera.yaw += event.getDeltaX() * (-this._camera.orbitSensitivity / 2);
            this._camera.pitch += event.getDeltaY() * (this._camera.orbitSensitivity / 2);
        }
    }

    private _onMouseWheel(event: EventMouse) {
        const currentDistance = this._camera.distance;

        this._camera.distance = currentDistance - Math.sign(event.getScrollY());
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
