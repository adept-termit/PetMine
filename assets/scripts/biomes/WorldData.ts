import {ChunkData} from "db://assets/scripts/biomes/ChunkData";

type Rarity = 'Legendary' | 'Rare' | 'Common';

export type BiomeBlockMap = {
    [biome: string]: {
        [key in Rarity]: string[];
    };
};

export class WorldData {
    public depthSettings: { 'rare': number, 'legendary': number } = {
        'rare': 14,
        'legendary': 4
    };
    private _currentBiome: string;
    private _chunkBiomeDictionary: Map<string, ChunkData> = new Map();


    get currentBiome(): string {
        return this._currentBiome;
    }

    set currentBiome(value: string) {
        this._currentBiome = value;
    }

    pushChunkBiomeDictionary(biomeType: string, chunkData: ChunkData) {
        this._chunkBiomeDictionary.set(biomeType, chunkData)
    }

    get chunkBiomeDictionary(): Map<string, ChunkData> {
        return this._chunkBiomeDictionary;
    }
}

export const worldData = new WorldData();