import {_decorator, CCInteger, Collider, Component, Node, tween, Vec3} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('AnimationController')
export class AnimationController extends Component {
    private readonly twinSettings = {
        scaleTo: new Vec3(1.2, 0.8, 1.2),
        eulerAnglesTo: new Vec3(4, 0, 4),
        backScale: new Vec3(0.8, 1.2, 0.8),
        backEulerAngles: new Vec3(-4, 0, -4),
        defaultScale: new Vec3(1, 1, 1),
        defaultEulerAngles: new Vec3(0, 0, 0)
    };

    takeDamage() {
        const collider = this.node.getComponent(Collider);
        // collider.enabled = false;

        // Запускаем твин-анимацию
        tween(this.node)
            .to(0.1, {
                scale: this.twinSettings.scaleTo,
                eulerAngles: this.twinSettings.eulerAnglesTo
            })
            .to(0.1, {
                scale: this.twinSettings.backScale,
                eulerAngles: this.twinSettings.backEulerAngles
            }, {easing: "sineInOut"})
            .to(0.1, {
                scale: this.twinSettings.defaultScale,
                eulerAngles: this.twinSettings.defaultEulerAngles
            }, {easing: "sineIn"})
            .call(() => {
                const collider = this.node.getComponent(Collider);
                // collider.enabled = true;
                // this.tempBlockCollider.setWorldPosition(this.space);
            })
            .start();
    }
}


