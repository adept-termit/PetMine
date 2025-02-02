import {_decorator, director, instantiate, Node, Vec3} from 'cc';

import {BiomeType, BlockType, worldData} from "db://assets/scripts/core/chunk/world";
import {ChunkInfo} from "db://assets/scripts/core/chunk/ChunkInfo";
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";
import {BlockInfo} from "db://assets/scripts/core/chunk/BlockInfo";
import {blockCreator} from "db://assets/scripts/core/chunk/BlockCreator";

const {ccclass} = _decorator;

@ccclass('BiomeGenerator')
export class BiomeGenerator {

    // /*
    // * Создание нодов для чанков в рамках биома
    // */
    // createChunkNodes(block: Node, pos: Vec3, biomeType: BiomeType): void {
    //     let blockNode: Node;
    //     let nodeName: string;
    //     let position: Vec3;
    //     let chunkData: ChunkData;
    //     let chunkInfo: ChunkInfo = new ChunkInfo(biomeType);
    //
    //     for (let i = 0; i < worldData.chunkCount; i++) {
    //         nodeName = biomeType + '_' + i
    //         position = new Vec3(pos.x, pos.y + worldData.chunkHeight * i, pos.z)
    //
    //         blockNode = instantiate(block);
    //         blockNode.name = nodeName
    //         blockNode.setPosition(position)
    //
    //         chunkData = new ChunkData();
    //         chunkData.chunkPos = position;
    //
    //         chunkInfo.pushSubChunkDictionary(nodeName, chunkData);
    //
    //         director.getScene().addChild(blockNode)
    //     }
    //
    //     worldData.pushChunkBiomeDictionary(biomeType, chunkInfo);
    // }
    //
    // /*
    // * Создание чанка в рамках биома
    // */
    // createChunk(biomeType: BiomeType) {
    //     // Получаем информацию о биоме из worldData
    //     const chunkInfo: ChunkInfo = worldData.chunkBiomeDictionary.get(biomeType);
    //
    //     // Перебираем все чанки, которые нужно создать
    //     for (let i = 0; i < worldData.chunkCount; i++) {
    //         const nodeName = `${biomeType}_${i}`;
    //         //this.generateSubChunk(nodeName, chunkInfo);
    //     }
    // }

    private _poolExistBlock: Node;

    get poolExistBlock(): Node {
        return this._poolExistBlock;
    }

    set poolExistBlock(value: Node) {
        this._poolExistBlock = value;
    }

    generateBiome(biomeType: BiomeType) {
        let chunkData: ChunkData = worldData.chunkBiomeDictionary.get(biomeType);

        const countBlocksInFloor: number = chunkData.chunkSize * 2;
        const countFloors: number = chunkData.chunkSizeHeight;
        const countBlocksTypes: number = chunkData.blockType.length;

        //TODO пока сделал статично, как будет время переделать динамику(проперти)
        const subBiomeChunk = 5;
        const countSubFloor = Math.ceil(countFloors / subBiomeChunk);


        let blockInfo: BlockInfo;
        let blockPosInChunk: Vec3;
        for (let y = 0; y < chunkData.chunkSizeHeight; y++) {

            // let uniqueChance, mediumChance, basicChance;
            //
            // if (y <= 10) {
            //     uniqueChance = 40;
            //     mediumChance = 25;
            //     basicChance = 35;
            // } else if (y <= 20) {
            //     uniqueChance = 0;
            //     mediumChance = 30;
            //     basicChance = 70;
            // } else {
            //     uniqueChance = 0;
            //     mediumChance = 0;
            //     basicChance = 100;
            // }

            for (let x = 0; x < chunkData.chunkSize; x++) {
                for (let z = 0; z < chunkData.chunkSize; z++) {
                    blockPosInChunk = new Vec3(x, y, z);
                    blockInfo = new BlockInfo();

                    //Самые низние этажи блоков
                    if (y <= 10) {
                        const randValue = Math.ceil(Math.random() * 100);

                        if (randValue < 40) {
                            this.instanceBlock()
                                //uniqueCount++;
                        } else if (randValue < 40 + 35) {
                            //mediumCount++;
                        } else {
                            //basicCount++;
                        }
                    }

                    chunkData.pushBlocksDictionary(blockPosInChunk, blockInfo);
                }
            }
        }


        /*        console.log(uniqueCount)
                console.log(mediumCount)
                console.log(basicCount)*/
    }

    private instanceBlock() {

    }

}

export const biomeGenerator = new BiomeGenerator();




















































