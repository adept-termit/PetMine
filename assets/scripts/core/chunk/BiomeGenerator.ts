import {_decorator, Node, Vec3, MeshRenderer, MeshCollider, utils, tween} from 'cc';

import {BiomeType, BlockTypeId, Rarity, TBlocksIdByBiomeType, worldData} from "db://assets/scripts/core/chunk/world";
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";
import {BlockInfo} from "db://assets/scripts/core/chunk/BlockInfo";
import {blockCreator} from "db://assets/scripts/core/chunk/BlockCreator";

const {ccclass} = _decorator;

export type TBlocks = {
    position: Vec3
    id: BlockTypeId,
}

@ccclass('BiomeGenerator')
export class BiomeGenerator {
    private _poolExistBlock: Node;

    set poolExistBlock(value: Node) {
        this._poolExistBlock = value;
    }

    private generateBlockTypePosInChunk(chunkData: ChunkData, blocksIdByBiomeType: TBlocksIdByBiomeType) {

        for (let y = 0; y < chunkData.chunkSizeHeight; y++) {
            for (let x = 0; x < chunkData.chunkSize; x++) {
                for (let z = 0; z < chunkData.chunkSize; z++) {

                    let blockPosInChunk: Vec3 = new Vec3(x, y, z);
                    let blockInfo = this.generateBlockTypeIdPosInChunk(y, blocksIdByBiomeType);

                    blockInfo.blockPos = blockPosInChunk;
                    chunkData.pushBlocksDictionary(blockPosInChunk.toString(), blockInfo);

                }
            }
        }
    }

    private createMeshCollider(chunkData: ChunkData, biomeType: BiomeType) {

        blockCreator.init(biomeType);
        for (let y = 0; y < chunkData.chunkSizeHeight; y++) {
            for (let x = 0; x < chunkData.chunkSize; x++) {
                for (let z = 0; z < chunkData.chunkSize; z++) {
                    const blockPos = new Vec3(x, y, z);
                    blockCreator.createBlockMesh(blockPos, x, y, z)
                }
            }
        }

        const geometry = blockCreator.createGeometry();

        chunkData.chunkNode.getComponent(MeshCollider).mesh = utils.MeshUtils.createDynamicMesh(
            0,
            geometry.dynamicGeometry,
            undefined,
            geometry.dynamicGeometryOptions
        );

    }

    private createMeshRenderer(chunkData: ChunkData, biomeType: BiomeType) {

        blockCreator.init(biomeType);
        for (let y = 0; y < chunkData.chunkSizeHeight; y++) {
            for (let x = 0; x < chunkData.chunkSize; x++) {
                for (let z = 0; z < chunkData.chunkSize; z++) {
                    const blockPos = new Vec3(x, y, z);
                    console.log(blockPos)
                    let foundBlock = chunkData.blocksDictionary.get(blockPos.toString())

                    const block = blockCreator.instanceBlock(foundBlock, this._poolExistBlock)
                    block.active = true
                    chunkData.chunkNode.addChild(block)
                }
            }
        }

        const geometry = blockCreator.createGeometry();

        chunkData.chunkNode.getComponent(MeshRenderer).mesh = utils.MeshUtils.createDynamicMesh(
            0,
            geometry.dynamicGeometry,
            undefined,
            geometry.dynamicGeometryOptions
        );
    }

    generateBiome(biomeType: BiomeType) {
        let chunkData: ChunkData = worldData.chunkBiomeDictionary.get(biomeType);
        const blocksIdByBiomeType: TBlocksIdByBiomeType = worldData.getBlocksIdByBiomeType(biomeType);

        this.generateBlockTypePosInChunk(chunkData, blocksIdByBiomeType);

        this.createMeshCollider(chunkData, biomeType)
        this.createMeshRenderer(chunkData, biomeType)
    }

    reGenerateBiome(biomeType: BiomeType, localPositionInChunk: Vec3) {
        let chunkData: ChunkData = worldData.chunkBiomeDictionary.get(biomeType);

        console.log(localPositionInChunk)
        if (chunkData.blocksDictionary.has(localPositionInChunk.toString())) {
            chunkData.blocksDictionary.delete(localPositionInChunk.toString())

            const customPos = localPositionInChunk.add(new Vec3(0.5, 0.5, 0.5))
            const blockToDelete = chunkData.chunkNode.getChildByName(customPos.toString());

            if (blockToDelete) {
                tween(blockToDelete)
                    .to(0.1, {scale: new Vec3(1.2, 0.8, 1.2), eulerAngles: new Vec3(4, 0, 4)}) // Растягивание и наклон
                    .to(0.1, {
                        scale: new Vec3(0.8, 1.2, 0.8),
                        eulerAngles: new Vec3(-4, 0, -4)
                    }, {easing: "sineInOut"}) // Сжатие с обратным наклоном
                    .to(0.1, {
                        scale: new Vec3(1, 1, 1),
                        eulerAngles: new Vec3(0, 0, 0)
                    }, {easing: "sineIn"}) // Возврат к нормальному состоянию
                    .call(() => blockToDelete.destroy())
                    .start();
                // blockToDelete.destroy();
            }

            if (chunkData.blocksDictionary.size === 0) {
                this.generateBiome(biomeType)
            }

            // const directions = {
            //     right: {x: customPos.x + 1, y: customPos.y, z: customPos.z},
            //     left: {x: customPos.x - 1, y: customPos.y, z: customPos.z},
            //     down: {x: customPos.x, y: customPos.y - 1, z: customPos.z},
            //     up: {x: customPos.x, y: customPos.y + 1, z: customPos.z},
            //     front: {x: customPos.x, y: customPos.y + 1, z: customPos.z  +1},
            //     back: {x: customPos.x, y: customPos.y + 1, z: customPos.z  -1},
            // };
            //
            // Object.values(directions).forEach(coordinates => {
            //     if (chunkData.chunkNode.getChildByName((new Vec3(coordinates.x, coordinates.y, coordinates.z).toString()))) {
            //         const block = chunkData.chunkNode.getChildByName((new Vec3(coordinates.x, coordinates.y, coordinates.z).toString()))
            //         block.active = true;
            //     }
            // });
            //
            // blockCreator.init(biomeType);
            // for (let y = 0; y < chunkData.chunkSizeHeight; y++) {
            //     for (let x = 0; x < chunkData.chunkSize; x++) {
            //         for (let z = 0; z < chunkData.chunkSize; z++) {
            //             const blockPos = new Vec3(x, y, z);
            //
            //             if (chunkData.blocksDictionary.has(blockPos.toString())) {
            //                 blockCreator.createBlockMesh(blockPos, x, y, z, true)
            //             }
            //         }
            //     }
            // }
            //
            // const geometry = blockCreator.createGeometry();
            //
            // chunkData.chunkNode.getComponent(MeshCollider).mesh = utils.MeshUtils.createDynamicMesh(
            //     0,
            //     geometry.dynamicGeometry,
            //     undefined,
            //     geometry.dynamicGeometryOptions
            // );
        }
    }

    private generateBlockTypeIdPosInChunk(y: number, blocksIdByBiomeType: TBlocksIdByBiomeType) {
        const blockInfo = new BlockInfo();
        const randValue = Math.random() * 100;

        if (y <= 7) {
            blockInfo.blockId = randValue < 20 ? this.getRandomBlock(blocksIdByBiomeType[Rarity.Legendary]) :
                randValue < 30 ? this.getRandomBlock(blocksIdByBiomeType[Rarity.Rare]) :
                    this.getRandomBlock(blocksIdByBiomeType[Rarity.Common]);
        } else if (y <= 13) {
            blockInfo.blockId = randValue < 20 ? this.getRandomBlock(blocksIdByBiomeType[Rarity.Rare]) :
                this.getRandomBlock(blocksIdByBiomeType[Rarity.Common]);
        } else {
            blockInfo.blockId = this.getRandomBlock(blocksIdByBiomeType[Rarity.Common]);
        }
        return blockInfo;
    }


    private getRandomBlock(blocks: BlockTypeId[]): BlockTypeId {
        return blocks[Math.floor(Math.random() * blocks.length)];
    }

}

export const biomeGenerator = new BiomeGenerator();



