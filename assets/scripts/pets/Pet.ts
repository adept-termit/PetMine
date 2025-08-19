import {_decorator, CCFloat, Component, Node, Quat, Vec3} from 'cc';
import {Block} from "db://assets/scripts/biomes/block/Block";
import {blockProvider} from "db://assets/scripts/biomes/BlockProvider";
import {GlobalData, globalData} from "db://assets/scripts/GlobalData";
import {PetFSM, PetState} from "db://assets/scripts/pets/fsm/PetFSM";

const {ccclass, property} = _decorator;

@ccclass('Pet')
export class Pet extends Component {
    @property({type: CCFloat}) damage = 10
    @property({type: CCFloat}) attacksPerSecond = 1;
    @property({type: CCFloat}) restTime = 1;
    @property({type: CCFloat}) moveSpeed = 5;

    private _followOffset = new Vec3();
    public targetBlock: Block;
    private _characterNode: Node;
    private _prevTriggerState = false;
    private _fsm: PetFSM;


    start() {
        this._fsm = new PetFSM(this);
        this._fsm.changeState(PetState.FollowToCharacter);
    }

    update(dt: number) {
        this._fsm.update(dt);
        this._checkTriggerState();
    }

    set followOffset(value: Vec3) {
        this._followOffset.set(value);
    }

    get followOffset() {
        return this._followOffset;
    }

    get fsm() {
        return this._fsm;
    }

    set characterNode(node: Node) {
        this._characterNode = node;
    }

    get characterNode(): Node {
        return this._characterNode;
    }

    private _checkTriggerState() {
        const trigger = globalData.triggerActivatePet;

        if (trigger !== this._prevTriggerState) {
            this._prevTriggerState = trigger;

            if (trigger) {
                this.fsm.changeState(PetState.Idle);
            } else {
                this._clearTarget();
                this.fsm.changeState(PetState.FollowToCharacter);
            }
        }
    }


    setTargetBlock(block: Block) {
        this.targetBlock = block;
        this.targetBlock.on(Block.EVENT_DESTROY, this._onTargetBlockDestroyed, this);
    }

    private _clearTarget() {
        if (this.targetBlock) {
            this.targetBlock.off(Block.EVENT_DESTROY, this._onTargetBlockDestroyed, this);
            blockProvider.releaseBlock(this.targetBlock);
        }
        this.targetBlock = null;
    }


    private _onTargetBlockDestroyed() {
        this.targetBlock = null;
        this.fsm.changeState(0);
    }
}
