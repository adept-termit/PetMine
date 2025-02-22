import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";

export enum BlockTypeId {
    Dirt = 'dirt',
    Stone = 'stone',
    Sand = 'sand',
    Stone_with_white_crystal = 'stone_with_white_crystal',
    Stone_with_gold_crystal = 'stone_with_gold_crystal',
    Stone_with_diamond_crystal = 'stone_with_diamond_crystal',
    Stone_with_red_crystal = 'stone_with_red_crystal',
    Stone_with_purple_crystal = 'stone_with_purple_crystal',
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

export enum Rarity {
    Common = 'common',
    Rare = 'rare',
    Legendary = 'legendary'
}

export type TBlocksIdByBiomeType = {
    [Rarity.Common]: BlockTypeId[],
    [Rarity.Rare]: BlockTypeId[],
    [Rarity.Legendary]: BlockTypeId[],
}

export class WorldData {
    private _chunkBiomeDictionary: Map<BiomeType, ChunkData> = new Map();

    pushChunkBiomeDictionary(biomeType: BiomeType, chunkData: ChunkData) {
        this._chunkBiomeDictionary.set(biomeType, chunkData)
    }

    get chunkBiomeDictionary(): Map<BiomeType, ChunkData> {
        return this._chunkBiomeDictionary;
    }

    getBlocksIdByBiomeType(biomeType: BiomeType): TBlocksIdByBiomeType {
        switch (biomeType) {
            case BiomeType.Forest:
                return {
                    [Rarity.Common]: [
                        BlockTypeId.Dirt,
                        BlockTypeId.Stone
                    ],
                    [Rarity.Rare]: [
                        BlockTypeId.Stone_with_red_crystal,
                        BlockTypeId.Stone_with_white_crystal
                    ],
                    [Rarity.Legendary]: [
                        BlockTypeId.Stone_with_gold_crystal,
                        BlockTypeId.Stone_with_purple_crystal
                    ]
                }
            case BiomeType.DarkForest:
                return {
                    [Rarity.Common]: [
                        BlockTypeId.Dirt,
                        BlockTypeId.Stone
                    ],
                    [Rarity.Rare]: [
                        BlockTypeId.Stone_with_red_crystal,
                        BlockTypeId.Stone_with_white_crystal
                    ],
                    [Rarity.Legendary]: [
                        BlockTypeId.Stone_with_gold_crystal,
                        BlockTypeId.Stone_with_purple_crystal
                    ]
                }
            case BiomeType.Pyramids:
                return {
                    [Rarity.Common]: [
                        BlockTypeId.Dirt,
                        BlockTypeId.Stone
                    ],
                    [Rarity.Rare]: [
                        BlockTypeId.Stone_with_red_crystal,
                        BlockTypeId.Stone_with_white_crystal
                    ],
                    [Rarity.Legendary]: [
                        BlockTypeId.Stone_with_gold_crystal,
                        BlockTypeId.Stone_with_purple_crystal
                    ]
                }
            case BiomeType.Beach:
                return {
                    [Rarity.Common]: [
                        BlockTypeId.Dirt,
                        BlockTypeId.Stone
                    ],
                    [Rarity.Rare]: [
                        BlockTypeId.Stone_with_red_crystal,
                        BlockTypeId.Stone_with_white_crystal
                    ],
                    [Rarity.Legendary]: [
                        BlockTypeId.Stone_with_gold_crystal,
                        BlockTypeId.Stone_with_purple_crystal
                    ]
                }
        }
    }

    getHpByBlockType(blockId: BlockTypeId){
        switch (blockId) {
            case BlockTypeId.Dirt:
            case BlockTypeId.Stone:
                return 1;
            case BlockTypeId.Stone_with_red_crystal:
            case BlockTypeId.Stone_with_white_crystal:
                return 2;
            case BlockTypeId.Stone_with_gold_crystal:
            case BlockTypeId.Stone_with_purple_crystal:
                return 3;
        }
    }

    getUvTextureByBlockTypeId(blockId: BlockTypeId)
    {
        switch (blockId) {
            case BlockTypeId.Dirt:
                return [0,1];
            case BlockTypeId.Stone:
                return [0,2];
            case BlockTypeId.Stone_with_red_crystal:
                return [0,3];
            case BlockTypeId.Stone_with_white_crystal:
                return [0,4];
            case BlockTypeId.Stone_with_gold_crystal:
                return [0,5];
            case BlockTypeId.Stone_with_purple_crystal:
                return [0,6];
        }
    }
}

export const worldData = new WorldData();
