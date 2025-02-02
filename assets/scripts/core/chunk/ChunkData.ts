import {_decorator, CCInteger, Node, Vec3} from 'cc';
import {BiomeType, BlockType} from "db://assets/scripts/core/chunk/world";
import {BlockInfo} from "db://assets/scripts/core/chunk/BlockInfo";

const {ccclass} = _decorator;

@ccclass('ChunkData')
export class ChunkData {
    private _blocks: Vec3[] = [];
    private _chunkPos: Vec3;
    private _blockType: BlockType[];
    private _chunkNode: Node;
    private _chunkSize: number;
    private _chunkSizeHeight: number;
    private _blocksDictionary: Map<Vec3, BlockInfo> = new Map();

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

    get blockType(): BlockType[] {
        return this._blockType;
    }

    set blockType(value: BlockType[]) {
        this._blockType = value;
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

    get blocksDictionary(): Map<Vec3, BlockInfo> {
        return this._blocksDictionary;
    }

    pushBlocksDictionary(vec3: Vec3, blockInfo: BlockInfo) {
        this._blocksDictionary.set(vec3, blockInfo)
    }
}




















































