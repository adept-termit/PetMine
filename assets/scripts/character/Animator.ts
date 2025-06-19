import {_decorator, animation, Component, Node} from 'cc';
import {eventService} from "db://assets/scripts/core/utils/EventService";

const {ccclass, property} = _decorator;

@ccclass('Animator')
export class Animator extends Component {
    @property(animation.AnimationController) animationController: animation.AnimationController;

    onEnable() {
        eventService.eventEmitter.on('ON_ANIMATION_HIT', this.setMine, this);
    }

    onDisable() {
        eventService.eventEmitter.off('ON_ANIMATION_HIT', this.setMine, this);
    }

    setJump(value: boolean): void {
        this.animationController.setValue("IsJump", value);
    }

    setWalk(value: boolean): void {
        this.animationController.setValue("IsWalk", value);
    }

    setMine(value: boolean): void {
        this.animationController.setValue("IsMineTrigger", value);
    }

    setFall(value: boolean): void {
        try {
            this.animationController.setValue("IsFall", value);
        } catch (e) {
            console.log(e)
        }
    }
}
