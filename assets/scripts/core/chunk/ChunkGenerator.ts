import {_decorator, CCInteger, Component, instantiate, MeshCollider, Node, Pool, tween, utils, Vec3} from 'cc';

import {BiomeType, BlockTypeId, Rarity, TBlocksIdByBiomeType, worldData} from "db://assets/scripts/core/chunk/world";
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";

import * as cc from "cc";
import {BlockInfo} from "db://assets/scripts/core/chunk/BlockInfo";
import {poolService} from "db://assets/scripts/core/utils/PoolService";

const {ccclass, property} = _decorator;

@ccclass('ChunkGenerator')
export class ChunkGenerator extends Component {
    @property({type: CCInteger}) chunkSize: number = 7;
    @property({type: CCInteger}) chunkSizeHeight: number = 5;
    @property({type: Node}) instanceCube: Node;
    @property({type: cc.Enum(BiomeType)}) biomeType: BiomeType = BiomeType.Forest

    public blocks = [];
    private customOffset = new Vec3(0.5, 0.5, 0.5)
    private blockCustomPos = new Vec3()

    private twinScaleTo = new Vec3(1.2, 0.8, 1.2)
    private twinEulerAnglesTo = new Vec3(4, 0, 4)

    private twinBackScale = new Vec3(0.8, 1.2, 0.8)
    private twinBackEulerAngles = new Vec3(-4, 0, -4)

    private twinScaleDefault = new Vec3(1, 1, 1)
    private twinEulerAnglesDefault = new Vec3(0, 0, 0)


    onLoad() {
        const blockTypes = [
            BlockTypeId.Dirt,
            BlockTypeId.Stone,
            BlockTypeId.Stone_with_white_crystal,
            BlockTypeId.Stone_with_gold_crystal,
            BlockTypeId.Stone_with_red_crystal,
            BlockTypeId.Stone_with_purple_crystal,
        ];

        poolService.init(this.instanceCube, blockTypes);

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

        for (let y = 0; y < chunkData.chunkSizeHeight; y++) {
            for (let x = 0; x < chunkData.chunkSize; x++) {
                for (let z = 0; z < chunkData.chunkSize; z++) {

                    let blockInfo = this.generateBlockTypeIdPosInChunk(y, blocksIdByBiomeType);

                    blockInfo.blockCustomPos = this.blockCustomPos.set(x, y, z).add(this.customOffset);

                    const entity = poolService.allocBlock(blockInfo.blockId);
                    entity.setPosition(blockInfo.blockCustomPos)
                    entity.setParent(this.node);

                    if (y >= chunkData.chunkSizeHeight - 2) {
                        entity.active = true

                    }

                    if (!this.blocks[blockInfo.blockCustomPos.y]) this.blocks[blockInfo.blockCustomPos.y] = [];
                    if (!this.blocks[blockInfo.blockCustomPos.y][blockInfo.blockCustomPos.x]) this.blocks[blockInfo.blockCustomPos.y][blockInfo.blockCustomPos.x] = [];
                    this.blocks[blockInfo.blockCustomPos.y][blockInfo.blockCustomPos.x][blockInfo.blockCustomPos.z] = entity;

                    blockInfo.blockNode = entity

                    chunkData.pushBlocksDictionary(blockInfo.blockCustomPos.toString(), blockInfo);
                }
            }
        }
    }

    reGenerateChunk(localPositionInChunk: Vec3) {
        let chunkData: ChunkData = worldData.chunkBiomeDictionary.get(this.biomeType);
        localPositionInChunk.add(this.customOffset);
        let block = chunkData.blocksDictionary.get(localPositionInChunk.toString())

        if (block) {
            let blockToDelete = block.blockNode
            if (blockToDelete) {
                tween(blockToDelete)
                    .to(0.1, {
                        scale: this.twinScaleTo,
                        eulerAngles:  this.twinEulerAnglesTo,
                    }) // Растягивание и наклон
                    .to(0.1, {
                        scale: this.twinBackScale,
                        eulerAngles:  this.twinBackEulerAngles,
                    }, {easing: "sineInOut"}) // Сжатие с обратным наклоном
                    .to(0.1, {
                        scale: this.twinScaleDefault,
                        eulerAngles:  this.twinEulerAnglesDefault,
                    }, {easing: "sineIn"}) // Возврат к нормальному состоянию
                    .call(() => {
                        blockToDelete.removeFromParent();
                        poolService.freeBlock(block.blockId, blockToDelete)
                        chunkData.blocksDictionary.delete(localPositionInChunk.toString())

                        delete this.blocks[localPositionInChunk.y][localPositionInChunk.x][localPositionInChunk.z];

                    })
                    .start();
            }

            if (chunkData.blocksDictionary.size === 0) {
                this.init()
            }

            this.spawnAroundBlock(localPositionInChunk)
        }
    }

    private getBlockAtPosition(x: number, y: number, z: number): Node | undefined {
        return this.blocks[y]?.[x]?.[z];
    }

    private spawnAroundBlock(localPositionInChunk: Vec3) {
        const { x, y, z } = localPositionInChunk;

        // Список направлений
        const directions = [
            [1, 0, 0],  // Вправо
            [-1, 0, 0], // Влево
            [0, 1, 0],  // Вверх
            [0, -1, 0], // Вниз
            [0, 0, 1],  // Вперед
            [0, 0, -1], // Назад
        ];

        // Активируем соседние блоки, если они существуют
        directions.forEach(([dx, dy, dz]) => {
            const block = this.getBlockAtPosition(x + dx, y + dy, z + dz);
            if (block) block.active = true;
        });
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

    start() {
    }

    update(deltaTime: number) {

    }
}
