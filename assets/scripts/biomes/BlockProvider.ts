import {Chunk} from "db://assets/scripts/biomes/Chunk";
import {Block} from "db://assets/scripts/biomes/block/Block";
import {Vec3} from "cc";

export class BlockProvider {
    private _activeChunk?: Chunk = null;
    private _occupiedBlocks = new Set<Block>();

    setActiveChunk(activeChunk: Chunk) {
        this._occupiedBlocks.clear();

        this._activeChunk = activeChunk;
        this._activeChunk.on(Chunk.EVENT_BLOCK_DESTROY, this._onBlockDestroyed, this);
    }

    getFreeBlock() {
        for (const block of this._activeChunk.blocks()) {
            if (this._occupiedBlocks.has(block)) continue;

            this._occupiedBlocks.add(block);

            return block;
        }

        return null;
    }

    private _onBlockDestroyed(block: Block) {
        this._occupiedBlocks.delete(block);
    }

    getBlocksInRadius(worldPosition: Vec3, radius: number, blockScale: number = 1): Block[] {
        return this._activeChunk.getBlocksInRadius(worldPosition, radius, blockScale);
    }
}

export const blockProvider = new BlockProvider();