import {_decorator, Component, game, sys} from 'cc';

import {gameManager} from "./fsm/GameManager";

const {ccclass, property} = _decorator;

@ccclass('GameBootstrapper')
export class GameBootstrapper extends Component {
    onLoad(): void {
        game.frameRate = sys.isMobile ? 60 : 120;

        gameManager.init();
    }
}


