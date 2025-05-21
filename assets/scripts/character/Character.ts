import {_decorator, Component, Node} from 'cc';
import {View} from "db://assets/scripts/character/View";
import {gameManager} from "db://assets/scripts/core/fsm/GameManager";
import {Move} from "db://assets/scripts/character/Move";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";
import {Animator} from "db://assets/scripts/character/Animator";
import {
    AnimationGraphPreviewBase
} from "@cocos/creator-types/editor/packages/scene/@types/cce/3d/manager/animation-graph-preview/base";
import {Hit} from "db://assets/scripts/character/Hit";

const {ccclass, property} = _decorator;

@ccclass('Character')
export class Character extends Component {
    @property(Node) bodyNode: Node;
    @property(View) view: View;
    @property(Move) move: Move;
    @property(Animator) animator: Animator;
    @property(Hit) hit: Hit;

    private _cameraNode: Node;

    async init() {
        this._cameraNode = gameManager.cameraNode;
        await this.view.changeSkin(playerProgress.progress.selected.skin || 'spider-man');

        //загружаем кирку
        await this.view.loadAxe(playerProgress.progress.selected.pickaxe);

        this.move.setCamera(this._cameraNode)

    }

    start() {

    }

    update(deltaTime: number) {

    }
}


