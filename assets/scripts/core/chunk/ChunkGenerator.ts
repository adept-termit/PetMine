import {_decorator, CCInteger, Component, Node, Vec3} from 'cc';

import {BiomeType, worldData} from "db://assets/scripts/core/chunk/world";
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

    onLoad() {
        const chunkData = new ChunkData();

        chunkData.chunkPos = this.node.getPosition();
        chunkData.chunkNode = this.node;
        chunkData.chunkSize = this.chunkSize;
        chunkData.chunkSizeHeight = this.chunkSizeHeight;

        worldData.pushChunkBiomeDictionary(this.biomeType, chunkData);

        this.initGenerator()
        biomeGenerator.generateBiome(this.biomeType);
    }

    reGenerateChunk(localPositionInChunk: Vec3) {
        this.initGenerator()
        biomeGenerator.reGenerateBiome(this.biomeType, localPositionInChunk);
    }

    private initGenerator() {
        biomeGenerator.poolExistBlock = this.instanceCube;
    }

    start() {
    }

    update(deltaTime: number) {

    }
}


