import {_decorator, animation, Component, Node} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('Animator')
export class Animator extends Component {
    @property(animation.AnimationController) animationController: animation.AnimationController;

    setJump(value: boolean): void {
        this.animationController.setValue("IsJump", value);
    }

    setWalk(value: boolean): void {
        this.animationController.setValue("IsWalk", value);
    }

    setFall(value: boolean): void {
        try {
            this.animationController.setValue("IsFall", value);
        }catch (e) {
            console.log(e)
        }


    }
}
