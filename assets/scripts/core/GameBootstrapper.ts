import {_decorator, Camera, Component, game, Node, sys} from 'cc';

import {gameManager} from "./fsm/GameManager";

const {ccclass, property} = _decorator;

@ccclass('GameBootstrapper')
export class GameBootstrapper extends Component {
    @property(Node) mainCamera: Node;

    onLoad(): void {
        game.frameRate = sys.isMobile ? 60 : 120;

        gameManager.cameraNode = this.mainCamera

        gameManager.init();
    }
}


