import {
    _decorator,
    CCInteger,
    CCBoolean,
    Component,
    Node,
    Vec3,
    tween,
    Collider,
    BoxCollider,
    PhysicsSystem,
    director
} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('BlockInfo')
export class BlockInfo extends Component {
    @property({type: CCInteger}) hp: number;
    @property({type: CCBoolean}) alreadyHit: boolean = false;
    @property({type: Node}) tempSupport: Node;

    private readonly twinSettings = {
        scaleTo: new Vec3(1.2, 0.8, 1.2),
        eulerAnglesTo: new Vec3(4, 0, 4),
        backScale: new Vec3(0.8, 1.2, 0.8),
        backEulerAngles: new Vec3(-4, 0, -4),
        defaultScale: new Vec3(1, 1, 1),
        defaultEulerAngles: new Vec3(0, 0, 0)
    };

    // Костыль чтобы не упираться в колайдер
    private space = new Vec3(0, 50, 0);

    animation() {
        const originalPosition = this.node.getWorldPosition();
        this.tempSupport.setWorldPosition(originalPosition);
        const collider = this.node.getComponent(Collider);
        collider.enabled = false;

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
                collider.enabled = true;
                this.tempSupport.setWorldPosition(this.space);
            })
            .start();
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


