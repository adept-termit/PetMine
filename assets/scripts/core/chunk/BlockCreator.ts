import {_decorator, Vec3} from 'cc';
import {worldData} from "db://assets/scripts/core/chunk/world";

const {ccclass} = _decorator;

@ccclass('BlockCreator')
export class BlockCreator {

    createBlock(blockPosition: Vec3, x: number, y: number, z: number) {
        if (this.getBlockAtPosition(x + 1, y, z) == 0) {
            this.generateRightSide(blockPosition)
        }
        if (this.getBlockAtPosition(x - 1, y, z) == 0) {
            this.generateLeftSide(blockPosition)
        }
        if (this.getBlockAtPosition(x, y, z - 1) == 0) {
            this.generateBackSide(blockPosition)
        }
        if (this.getBlockAtPosition(x, y, z + 1) == 0) {
            this.generateFrontSide(blockPosition)
        }
        if (this.getBlockAtPosition(x, y + 1, z) == 0) {
            this.generateTopSide(blockPosition)
        }
        if (this.getBlockAtPosition(x, y - 1, z) == 0) {
            this.generateBottomSide(blockPosition)
        }
    }


    private getBlockAtPosition(x: number, y: number, z: number): number {
        if (
            x >= 0 && x < worldData.chunkSize &&
            y >= 0 && y < worldData.chunkHeight &&
            z >= 0 && z < worldData.chunkSize
        ) {
            const blockIndex = this._chunkData.blocks.find(block =>
                block.x === x && block.y === y && block.z === z
            );

            if (blockIndex === undefined) {
                return 0
            } else {
                return 1
            }
        } else {
            return 0;
        }
    }
}

export const blockCreator = new BlockCreator();
