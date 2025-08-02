import {_decorator, CCFloat, Component, Node, Quat, Vec3} from 'cc';
import {Block} from "db://assets/scripts/biomes/block/Block";
import {blockProvider} from "db://assets/scripts/biomes/BlockProvider";
import {GlobalData, globalData} from "db://assets/scripts/GlobalData";
import {eventService} from "db://assets/scripts/core/utils/EventService";
import {PetFSM, PetState} from "db://assets/scripts/pets/fsm/PetFSM";

const {ccclass, property} = _decorator;
//
// const enum PetState {
//     Idle,
//     FollowToCharacter,
//     MoveToTarget,
//     AttackTarget
// }

const tempVec3 = new Vec3();
const petHeightOffset = 0.5; // Высота, на которой будет летать питомец
const minDistance = 0.5; // Минимальная дистанция до персонажа

@ccclass('Pet')
export class Pet extends Component {
    @property({type: CCFloat}) damage = 10
    @property({type: CCFloat}) attacksPerSecond = 1;
    @property({type: CCFloat}) restTime = 1;
    @property({type: CCFloat}) moveSpeed = 5;

    private _followOffset = new Vec3();
    private _state = PetState.FollowToCharacter;
    public targetBlock: Block;
    private _characterNode: Node;

    private _attackTimer = 0;
    private _reachedTarget: boolean = false;

    private _prevTriggerState = false;
    private _fsm: PetFSM;

    set followOffset(value: Vec3) {    this._followOffset.set(value); }
    get followOffset() { return this._followOffset; }


    get fsm() { return this._fsm; }

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
                // this._changeState(PetState.Idle);
            } else {
                this._clearTarget();
                this.fsm.changeState(PetState.FollowToCharacter);
            }
        }
    }

     start() {
         this._fsm = new PetFSM(this);
         this._fsm.changeState(PetState.FollowToCharacter);

         // this.schedule(() => {
         //     this._checkTriggerState()
         // }, 1);



        //this._changeState(PetState.FollowToCharacter);
        //this.tryFindNextTargetBlock();
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

     update(dt: number) {
         this._fsm.update(dt);
         this._checkTriggerState();

        // console.log(this._state)
        // switch (this._state) {
        //     case PetState.FollowToCharacter: {
        //         this.followToCharacter(dt);
        //         break;
        //     }
        //     case PetState.Idle: {
        //         this.tryFindNextTargetBlock();
        //         break;
        //     }
        //     case PetState.MoveToTarget: {
        //         console.log('MoveToTarget')
        //         const currentPos = this.node.getWorldPosition();
        //         const newPos = new Vec3();
        //         const targetPosition = this.targetBlock.node.getWorldPosition().clone().add(new Vec3(0, 1.5, 0));
        //         Vec3.lerp(newPos, currentPos, targetPosition, dt * this.moveSpeed);
        //         this.node.setWorldPosition(newPos);
        //
        //         // Установка флага при достижении цели
        //         if (!this._reachedTarget && Vec3.distance(newPos, targetPosition) < 0.1) {
        //             this._reachedTarget = true;
        //             console.log(6567567)
        //             this._changeState(PetState.AttackTarget)
        //         }
        //         break;
        //     }
        //     case PetState.AttackTarget: {
        //         if (!this.targetBlock) break;
        //
        //         if (this._attackTimer >= 1 / this.attacksPerSecond) {
        //             this._attackBlock(this.targetBlock);
        //
        //             break;
        //         }
        //
        //         this._attackTimer += dt;
        //
        //         break;
        //     }
        // }
    }


    // setTargetBlock(block: Block) {
    //     this.targetBlock = block;
    //     this.targetBlock.on(Block.EVENT_DESTROY, this._onTargetBlockDestroyed, this);
    //
    //     // this._changeState(PetState.MoveToTarget);
    // }

    private _attackBlock(block: Block) {
        block.takeDamage(this.damage);

        this._attackTimer = 0;
    }

    tryFindNextTargetBlock() {
        this.scheduleOnce(() => {
            const freeBlock = blockProvider.getFreeBlock();

            if (!freeBlock) {
                this._state = PetState.Idle;

                return;
            }

            this.setTargetBlock(freeBlock);
        }, this.restTime);
    }

    private _changeState(newState: PetState) {
        switch (newState) {
            case PetState.AttackTarget: {
                if (!this.targetBlock) {
                    this._state = PetState.Idle;

                    return;
                }

                // this.teleportToBlock(this._targetBlock);
            }
        }

        this._state = newState;
    }

    private _onTargetBlockDestroyed() {
        this.targetBlock = null;
        this.fsm.changeState(0);
        //this.tryFindNextTargetBlock();
    }

    private followToCharacter(dt: number) {
        if (!this._characterNode) return;

        const characterWorldPos = this._characterNode.getWorldPosition();
        const characterWorldRot = this._characterNode.getWorldRotation();

        const rotatedOffset = new Vec3();
        Vec3.transformQuat(rotatedOffset, this._followOffset, characterWorldRot);

        const targetPos = new Vec3();
        Vec3.add(targetPos, characterWorldPos, rotatedOffset);
        targetPos.y = this.node.worldPosition.y; // игнорируем изменение Y

        const currentPos = this.node.getWorldPosition();
        const distance = Vec3.distance(currentPos, targetPos);

        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, currentPos);
        direction.normalize();

        const targetRot = new Quat();
        Quat.fromViewUp(targetRot, direction, Vec3.UP);

        const smoothRot = new Quat();
        Quat.rotateTowards(smoothRot, this.node.getWorldRotation(), targetRot, 360 * dt);

        const smoothPos = new Vec3();
        const lerpSpeed = 2 + distance * 3;
        Vec3.lerp(smoothPos, currentPos, targetPos, dt * lerpSpeed);
        smoothPos.y = currentPos.y;

        this.node.setWorldPosition(smoothPos);
        this.node.setWorldRotation(smoothRot);
    }
}
