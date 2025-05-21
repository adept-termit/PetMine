import {_decorator, CCInteger, Node, Vec3} from 'cc';

const {ccclass} = _decorator;

@ccclass('ChunkData')
export class ChunkData {
    private _chunkNode: Node;
    private _blocksInChunkByPos = [];

    get chunkNode(): Node {
        return this._chunkNode;
    }

    set chunkNode(value: Node) {
        this._chunkNode = value;
    }

    get blocksInChunkByPos(): any[] {
        return this._blocksInChunkByPos;
    }

    set blocksInChunkByPos(value: any[]) {
        this._blocksInChunkByPos = value;
    }
}
