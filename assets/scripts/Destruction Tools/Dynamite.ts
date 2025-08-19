import {_decorator, Button, CCFloat, Component, Node} from 'cc';
import {blockProvider} from "db://assets/scripts/biomes/BlockProvider";

const {ccclass, property} = _decorator;

@ccclass('Dynamite')
export class Dynamite extends Component {
    @property(CCFloat) radius = 1;
    @property(CCFloat) damage = 100;

    start() {
        this.scheduleOnce(() => {
            this.explode();
        }, 3);
    }

    explode() {
        const blocksToDestroy = blockProvider.getBlocksInRadius(this.node.getWorldPosition(), this.radius, 1);

        for (const block of blocksToDestroy) {
            block.takeDamage(this.damage);
        }

        this.node.destroy();
        this.node.emit('exploded');
    }
}


