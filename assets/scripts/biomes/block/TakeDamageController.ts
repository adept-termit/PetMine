import {_decorator, CCBoolean, CCInteger, Component, Node} from 'cc';

import {worldData} from "db://assets/scripts/biomes/WorldData";
import {eventService} from "db://assets/scripts/core/utils/EventService";
import {AnimationController} from "db://assets/scripts/biomes/block/AnimationController";

const {ccclass, property} = _decorator;

@ccclass('TakeDamageController')
export class TakeDamageController extends Component {
    @property({type: CCInteger}) hp: number;
    @property({type: CCBoolean}) firstHit: boolean = false;
    @property({type: CCInteger}) maxHealth: number;

    private animationController: AnimationController;

    protected onLoad() {
        this.animationController = this.node.getComponent(AnimationController)
    }

    checkHit() {
        if (this.firstHit) return

        const chunkData = worldData.chunkBiomeDictionary.get(worldData.currentBiome);

        eventService.eventEmitter.emit('SPAWN_BLOCKS_AROUND_BLOCK', chunkData, this.node);

        this.firstHit = true;
    }

    applyDamageToBlock(damage: number) {
        console.log(1111111)
        this.hp -= damage;

        if (this.hp <= 0) {
            this.deleteBlock()
        } else {
            //this.animationController.takeDamage()
        }
    }

    deleteBlock() {
        const chunkData = worldData.chunkBiomeDictionary.get(worldData.currentBiome);
        eventService.eventEmitter.emit('DELETE_TARGET_FROM_PET', this.node);
        eventService.eventEmitter.emit('DROP_BLOCK', chunkData, this.node);
    }
}


