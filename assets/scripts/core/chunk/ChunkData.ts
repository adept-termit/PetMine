import {_decorator, Vec3} from 'cc';

const {ccclass} = _decorator;

@ccclass('ChunkData')
export class ChunkData {
    private _blocks: Vec3[] = [];
    private _chunkPos: Vec3;

    get blocks(): Vec3[] {
        return this._blocks;
    }

    set blocks(value: Vec3[]) {
        this._blocks = value;
    }

    get chunkPos(): Vec3 {
        return this._chunkPos;
    }

    set chunkPos(value: Vec3) {
        this._chunkPos = value;
    }
}