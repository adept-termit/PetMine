import {_decorator, Component, Node, Prefab} from 'cc';
import {poolService} from "db://assets/scripts/core/utils/PoolService";
const { ccclass, property } = _decorator;

@ccclass('CreatePropsPoolService')
export class CreatePropsPoolService extends Component {
    @property(Node) airplaneProps: Node;

    onLoad() {
        poolService.init(this.airplaneProps, 50);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


