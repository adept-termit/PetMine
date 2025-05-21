import {sys, Vec3} from 'cc';
import {IInput} from "db://assets/scripts/core/Input/IInput";
import {DesktopGame} from "db://assets/scripts/core/Input/DesktopGame";

export type TInputMap = {
    forward: boolean;
    right: boolean;
    back: boolean;
    left: boolean;
    jump: boolean;
}

export class GameInput {
    private _inputMap: TInputMap = {
        forward: false,
        right: false,
        back: false,
        left: false,
        jump: false,
    };
    private _currentInput: IInput;

    constructor() {
        if (sys.isMobile) {
            this._currentInput = new DesktopGame(this._inputMap);
        } else {
            this._currentInput = new DesktopGame(this._inputMap);
        }

        this._currentInput.enable();
    }

    getVerticalMovement() {
        let verticalMovement = 0;

        if (this._inputMap.forward) verticalMovement += 1;
        if (this._inputMap.back) verticalMovement -= 1;

        return verticalMovement;
    }

    getHorizontalMovement() {
        let horizontalMovement = 0;

        if (this._inputMap.left) horizontalMovement -= 1;
        if (this._inputMap.right) horizontalMovement += 1;

        return horizontalMovement;
    }

    getMovementVector(target: Vec3) {
        const verticalMovement = this.getVerticalMovement();
        const horizontalMovement = this.getHorizontalMovement();

        return target.set(horizontalMovement, 0, verticalMovement);
    }

    get isJumpPressed(): boolean {
        return this._inputMap.jump;
    }
}

export const gameInput = new GameInput();
