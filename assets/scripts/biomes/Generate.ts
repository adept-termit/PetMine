import {_decorator, Component, instantiate, Node, Vec3, Quat, randomRange} from 'cc';

import {poolService} from "db://assets/scripts/core/utils/PoolService";
import {worldData} from "db://assets/scripts/biomes/WorldData";
import {ChunkData} from "db://assets/scripts/biomes/ChunkData";
import {eventService} from "db://assets/scripts/core/utils/EventService";

const {ccclass, property} = _decorator;

@ccclass('Generate')
export class Generate extends Component {
    private readonly customOffset = new Vec3(0.5, 0.5, 0.5);
    private blockPos = new Vec3();
    private blocksRarity: object
    private blocksInChunkByPos = [];
    private readonly block_directions = [
        [1, 0, 0],  // Вправо
        [-1, 0, 0], // Влево
        [0, 1, 0],  // Вверх
        [0, -1, 0], // Вниз
        [0, 0, 1],  // Вперед
        [0, 0, -1], // Назад
    ];

    onEnable() {
        eventService.eventEmitter.on('SPAWN_BLOCKS_AROUND_BLOCK', this.spawnAroundBlock, this);
        eventService.eventEmitter.on('DROP_BLOCK', this.dropBlock, this);
    }

    onDisable() {
        eventService.eventEmitter.off('SPAWN_BLOCKS_AROUND_BLOCK', this.spawnAroundBlock, this);
        eventService.eventEmitter.off('DROP_BLOCK', this.dropBlock, this);
    }

    init(chunk: Node, blocksRarity: object, biomeName: string, width: number, height: number) {

        this.blocksRarity = blocksRarity;

        const chunkData = new ChunkData();

        // blocksMap: Map<Y, Map<X, Map<Z, Node>>>
        const blocksMap = new Map<number, Map<number, Map<number, Node>>>();

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                for (let z = 0; z < width; z++) {

                    const blockName = this.getRandomBlockName(y);
                    const blockPos = this.blockPos.set(x, y, z).add(this.customOffset);

                    const entity = poolService.allocBlock(blockName);
                    entity.setPosition(blockPos);
                    chunk.addChild(entity);

                    if (y >= height - 2) {
                        entity.active = true;
                    }

                    const yMap = blocksMap.get(blockPos.y) ?? new Map();
                    const xMap = yMap.get(blockPos.x) ?? new Map();

                    xMap.set(blockPos.z, entity);
                    yMap.set(blockPos.x, xMap);

                    blocksMap.set(blockPos.y, yMap);
                }
            }
        }

        chunkData.chunkNode = chunk;
        chunkData.blocksInChunkByPos = blocksMap;

        worldData.pushChunkBiomeDictionary(biomeName, chunkData);
    }

    private getRandomBlockName(depth: number) {
        //с расчетом что базовая глубина 20, можно менять в worldData.depthSettings
        const randValue = Math.random() * 100;

        if (depth <= worldData.depthSettings.legendary) {
            return randValue < 20 ? this.getRandomBlock(this.blocksRarity.legendary) :
                randValue < 30 ? this.getRandomBlock(this.blocksRarity.rare) :
                    this.getRandomBlock(this.blocksRarity.common);
        } else if (depth <= worldData.depthSettings.rare) {
            return randValue < 30 ? this.getRandomBlock(this.blocksRarity.rare) :
                this.getRandomBlock(this.blocksRarity.common);
        } else {
            return this.getRandomBlock(this.blocksRarity.common);
        }
    }

    private getRandomBlock(blocks: []) {
        return blocks[Math.floor(Math.random() * blocks.length)];
    }

    private spawnAroundBlock(chunkData: ChunkData, block: Node) {

        const {x, y, z} = block.getPosition();

        this.block_directions.forEach(([dx, dy, dz]) => {
            const block = this.getBlockAtPosition(chunkData, x + dx, y + dy, z + dz);
            if (block && !block.active) block.active = true;
        });
    }

    private getBlockAtPosition(chunkData: ChunkData, x: number, y: number, z: number): Node | undefined {

        return chunkData.blocksInChunkByPos.get(y)?.get(x)?.get(z);
    }

    private dropBlock(chunkData: ChunkData, block: Node) {

        const {x, y, z} = block.getPosition();

        block.removeFromParent();
        poolService.freeBlock(block.name, block);

        const yMap = chunkData.blocksInChunkByPos.get(y);
        if (!yMap) return;

        const xMap = yMap.get(x);
        if (!xMap) return;

        xMap.delete(z); // Удаляем Z


        if (xMap.size === 0) {
            yMap.delete(x); // Удаляем X если пуст
        }

        if (yMap.size === 0) {
            chunkData.blocksInChunkByPos.delete(y); // Удаляем Y если пуст
        }
    }
}


