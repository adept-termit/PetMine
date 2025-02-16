import {_decorator, CCInteger, Component, instantiate, MeshCollider, Node, Pool, tween, utils, Vec3} from 'cc';

import {BiomeType, BlockTypeId, Rarity, TBlocksIdByBiomeType, worldData} from "db://assets/scripts/core/chunk/world";
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";

import * as cc from "cc";
import {BlockInfo} from "db://assets/scripts/core/chunk/BlockInfo";
import {blockCreator} from "db://assets/scripts/core/chunk/BlockCreator";

const {ccclass, property} = _decorator;

@ccclass('ChunkGenerator')
export class ChunkGenerator extends Component {
    @property({type: CCInteger}) chunkSize: number = 7;
    @property({type: CCInteger}) chunkSizeHeight: number = 5;
    @property({type: Node}) instanceCube: Node;
    @property({type: cc.Enum(BiomeType)}) biomeType: BiomeType = BiomeType.Forest

    onLoad() {
        //
        // const newPool = new Pool<Node>(
        //     () => instantiate(this.instanceCube.getChildByName(BlockTypeId.Stone_with_purple_crystal)),
        //     5
        // );
        //
        // for (let i = 0; i < 5; i++) {
        //     const asd = newPool.alloc();
        //     asd.setPosition(new Vec3(i, i * 2, i))
        //     this.node.addChild(asd)
        // }
        //
        // for (let i = 0; i < this.node.children.length; i++) {
        //     const child = this.node.children[i];
        //     child.active = false
        //     newPool.free(child)
        // }
        // for (let i = 0; i < 5; i++) {
        //     const asd = newPool.alloc();
        //     asd.setPosition(new Vec3(i, i * 2, i))
        //     asd.active = true
        //     this.node.addChild(asd)
        // }
        //
        // for (let i = 0; i < this.node.children.length; i++) {
        //     const child = this.node.children[i];
        //     child.active = false
        //     newPool.free(child)
        // }
        // console.log(newPool)

        this.init()
    }

    private init() {
        const chunkData = new ChunkData();

        chunkData.chunkPos = this.node.getPosition();
        chunkData.chunkNode = this.node;
        chunkData.chunkSize = this.chunkSize;
        chunkData.chunkSizeHeight = this.chunkSizeHeight;

        worldData.pushChunkBiomeDictionary(this.biomeType, chunkData);

        this.generateBlockTypePosInChunk(chunkData);
    }

    private generateBlockTypePosInChunk(chunkData: ChunkData) {
        const blocksIdByBiomeType: TBlocksIdByBiomeType = worldData.getBlocksIdByBiomeType(this.biomeType);

        blockCreator.init(this.biomeType);
        for (let y = 0; y < chunkData.chunkSizeHeight; y++) {
            for (let x = 0; x < chunkData.chunkSize; x++) {
                for (let z = 0; z < chunkData.chunkSize; z++) {

                    let blockPosInChunk: Vec3 = new Vec3(x, y, z);
                    let blockInfo = this.generateBlockTypeIdPosInChunk(y, blocksIdByBiomeType);

                    blockInfo.blockPos = blockPosInChunk;
                    blockInfo.blockCustomPos = new Vec3(x, y, z).add(new Vec3(0.5, 0.5, 0.5));

                    chunkData.pushBlocksDictionary(blockPosInChunk.toString(), blockInfo);

                    const block = blockCreator.instanceBlock(blockInfo, this.instanceCube)

                    if (y >= chunkData.chunkSizeHeight - 2) {
                        block.active = true
                    }

                    chunkData.chunkNode.addChild(block)
                }
            }
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
            blockInfo.blockId = randValue < 30 ? this.getRandomBlock(blocksIdByBiomeType[Rarity.Rare]) :
                this.getRandomBlock(blocksIdByBiomeType[Rarity.Common]);
        } else {
            blockInfo.blockId = this.getRandomBlock(blocksIdByBiomeType[Rarity.Common]);
        }

        return blockInfo;
    }

    private getRandomBlock(blocks: BlockTypeId[]): BlockTypeId {
        return blocks[Math.floor(Math.random() * blocks.length)];
    }

    reGenerateChunk(localPositionInChunk: Vec3) {
        let chunkData: ChunkData = worldData.chunkBiomeDictionary.get(this.biomeType);

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
                this.init()
            }

            const directions = {
                right: {x: customPos.x + 1, y: customPos.y, z: customPos.z},
                left: {x: customPos.x - 1, y: customPos.y, z: customPos.z},
                up: {x: customPos.x, y: customPos.y + 1, z: customPos.z},
                down: {x: customPos.x, y: customPos.y - 1, z: customPos.z},
                front: {x: customPos.x, y: customPos.y, z: customPos.z + 1},
                back: {x: customPos.x, y: customPos.y, z: customPos.z - 1},
            };


            Object.values(directions).forEach(coordinates => {
                const block = chunkData.chunkNode.getChildByName((new Vec3(coordinates.x, coordinates.y, coordinates.z).toString()))
                if (block) {
                    block.active = true;
                }
            });
        }
    }

    start() {
    }

    update(deltaTime: number) {

    }
}





























































