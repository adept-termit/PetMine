import {_decorator, CCInteger, Component, Node} from 'cc';

import {BiomeType, BlockType, worldData} from "db://assets/scripts/core/chunk/world";
import {BlockTypes} from "db://assets/scripts/core/chunk/BlockTypes";
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";

import * as cc from "cc";
import {biomeGenerator} from "db://assets/scripts/core/chunk/BiomeGenerator";

const {ccclass, property} = _decorator;

@ccclass('ChunkGenerator')
export class ChunkGenerator extends Component {
    @property({type: CCInteger}) chunkSize: number = 7;
    @property({type: CCInteger}) chunkSizeHeight: number = 5;
    @property({type: Node}) instanceCube: Node;

    @property({type: cc.Enum(BiomeType)}) biomeType: BiomeType = BiomeType.Forest
    @property([BlockTypes]) countBlockTypesInBiome: BlockTypes[] = [];

    onLoad() {
        const blockTypes: BlockType[] = this.countBlockTypesInBiome.map((blockTypeObj) => blockTypeObj.BlockType);

        const chunkData = new ChunkData();

        chunkData.chunkPos = this.node.getPosition();
        chunkData.blockType = blockTypes;
        chunkData.chunkNode = this.node;
        chunkData.chunkSize = this.chunkSize;
        chunkData.chunkSizeHeight = this.chunkSizeHeight;

        worldData.pushChunkBiomeDictionary(this.biomeType, chunkData);

        biomeGenerator.poolExistBlock = this.instanceCube;
        biomeGenerator.generateBiome(this.biomeType);
    }

    start() {
        console.log(123)
    }

    update(deltaTime: number) {

    }
}


