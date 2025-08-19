import {_decorator, CCBoolean, CCInteger, Component, Eventify, Node, Vec3, EventTarget, tween, Tween} from 'cc';

const {ccclass, property} = _decorator;

const DEFAULT_TWEEN_SETTING = {
    scaleTo: new Vec3(1.1, 0.9, 1.1),
    eulerAnglesTo: new Vec3(2, 0, 2),
    backScale: new Vec3(0.9, 1.1, 0.9),
    backEulerAngles: new Vec3(-2, 0, -2),
    defaultScale: new Vec3(1, 1, 1),
    defaultEulerAngles: new Vec3(0, 0, 0)
} as const;

@ccclass('Block')
export class Block extends Eventify(Component) {
    static readonly EVENT_DESTROY = 'block:destroy';

    @property(Node) meshNode: Node;
    @property({type: CCInteger}) currentHealth: number = 0;

    private _hitTween: Tween<Node>;

    destroyed = false;

    takeDamage(damage: number) {
        this.currentHealth -= damage;

        if (this.currentHealth <= 0) {
            this.destroyed = true;

            this.emit(Block.EVENT_DESTROY, this);

            return;
        }

        this.playHitTween();
    }

    playHitTween() {
        const tweenActionDuration = 0.1;
        const tweenSettings = DEFAULT_TWEEN_SETTING;

        if (this._hitTween) {
            this._hitTween.start(0);

            return;
        }

        this._hitTween = tween(this.meshNode)
            .to(tweenActionDuration, {
                scale: tweenSettings.scaleTo,
                eulerAngles: tweenSettings.eulerAnglesTo
            })
            .to(tweenActionDuration, {
                scale: tweenSettings.backScale,
                eulerAngles: tweenSettings.backEulerAngles
            }, {easing: "sineInOut"})
            .to(tweenActionDuration, {
                scale: tweenSettings.defaultScale,
                eulerAngles: tweenSettings.defaultEulerAngles
            }, {easing: "sineIn"})
            .start();
    }
}


