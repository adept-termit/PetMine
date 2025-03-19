import {_decorator, CCInteger, Node, Vec3} from 'cc';
import {BlockInfo} from "db://assets/scripts/core/chunk/BlockInfo";

const {ccclass} = _decorator;

@ccclass('ChunkData')
export class ChunkData {
    private _chunkPos: Vec3;
    private _chunkNode: Node;
    private _chunkSize: number;
    private _chunkSizeHeight: number;
    private _blocksDictionary: Map<string, BlockInfo> = new Map();
    public blocks= []; //TODO костяль для ломания болокв и петов и перса

    get chunkPos(): Vec3 {
        return this._chunkPos;
    }

    set chunkPos(value: Vec3) {
        this._chunkPos = value;
    }

    get chunkNode(): Node {
        return this._chunkNode;
    }

    set chunkNode(value: Node) {
        this._chunkNode = value;
    }

    get chunkSize(): number {
        return this._chunkSize;
    }

    set chunkSize(value: number) {
        this._chunkSize = value;
    }

    get chunkSizeHeight(): number {
        return this._chunkSizeHeight;
    }

    set chunkSizeHeight(value: number) {
        this._chunkSizeHeight = value;
    }

    get blocksDictionary(): Map<string, BlockInfo> {
        return this._blocksDictionary;
    }

    pushBlocksDictionary(vec3: string, blockInfo: BlockInfo) {
        this._blocksDictionary.set(vec3, blockInfo)
    }
}
