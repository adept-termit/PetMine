import {ChunkInfo} from "db://assets/scripts/core/chunk/ChunkInfo";
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";

export enum BlockType {
    Dirt,
    Stone,
    Stone_with_white_crystal,
    Stone_with_gold_crystal,
    Stone_with_diamond_crystal,
    Stone_with_red_crystal,
    Stone_with_purple_crystal,
}

export enum BiomeType {
    Forest = 'Forest',
    DarkForest = 'DarkForest',
    Pyramids = 'Pyramids',
    Beach = 'Beach',
}

export enum BlockPriceType {
    Dollar,
    Gold,
    Crystal,
}

const enum Rarity {
    Common = 'common',
    Epic = 'epic',
    Legendary = 'legendary'
}

export class WorldData {
    private _chunkBiomeDictionary: Map<BiomeType, ChunkData> = new Map();

    pushChunkBiomeDictionary(biomeType: BiomeType, chunkData: ChunkData) {
        this._chunkBiomeDictionary.set(biomeType, chunkData)
    }

    get chunkBiomeDictionary(): Map<BiomeType, ChunkData> {
        return this._chunkBiomeDictionary;
    }

}

export const worldData = new WorldData();



































