import {_decorator, CCInteger, Component, director, instantiate, Node, Prefab, Vec3, CCObject} from 'cc';
import {worldData, BiomeType, BlockPriceType, BlockType} from "db://assets/scripts/core/chunk/world";
import {biomeGenerator} from "db://assets/scripts/core/chunk/BiomeGenerator";
import * as cc from "cc";
import {BlockTypes} from "db://assets/scripts/core/chunk/BlockTypes";

const {ccclass, property} = _decorator;

@ccclass('EntryPoint')
export class EntryPoint extends Component {
    @property({type: CCInteger}) chunkSize: number = 7;
    @property({type: CCInteger}) chunkSizeHeight: number = 5;
    @property({type: CCInteger}) countChunk: number = 5;

    @property({type: cc.Enum(BiomeType)}) biomeType: BiomeType = BiomeType.Beach
    @property([BlockTypes]) blockTypes: BlockTypes[] = [];

    @property({type: Node}) chunkBlock: Node;

    onLoad() {
        worldData.chunkSize = this.chunkSize;
        worldData.chunkHeight = this.chunkSizeHeight;
        worldData.chunkCount = this.countChunk;

        console.log(this.blockTypes)
        //создание нодов для чанков
        biomeGenerator.createChunkNodes(
            this.chunkBlock,
            new Vec3(0, 0, 0),
            BiomeType.Forest
        )

        //создание чанков бля биома
        biomeGenerator.createChunk(BiomeType.Forest);
        biomeGenerator.generateBiome(BiomeType.Forest);

    }

    start() {

    }

    update(deltaTime: number) {

    }

    private createBlock(pos: Vec3): void {
        // this._block = instantiate(this.block);
        // this._block.setPosition(pos)
        //
        // director.getScene().addChild(this._block)
    }
}


