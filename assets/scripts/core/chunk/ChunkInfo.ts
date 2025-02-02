import {_decorator} from 'cc';
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";
import {BiomeType} from "db://assets/scripts/core/chunk/world";

const {ccclass} = _decorator;

@ccclass('ChunkInfo')
export class ChunkInfo {
    private readonly _biomeName: BiomeType;
    private _subChunkDictionary: Map<string, ChunkData> = new Map();

    constructor(biomeName: BiomeType) {
        this._biomeName = biomeName;
    }

    get biomeName(): string {
        return this._biomeName;
    }

    get subChunkDictionary(): Map<string, ChunkData> {
        return this._subChunkDictionary;
    }

    pushSubChunkDictionary(chunkSubName: string, chunkData: ChunkData) {
        this.subChunkDictionary.set(chunkSubName, chunkData);
    }
}
