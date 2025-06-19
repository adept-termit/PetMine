import {_decorator, CCInteger, Node, Vec3} from 'cc';

const {ccclass} = _decorator;

@ccclass('ChunkData')
export class ChunkData {
    private _chunkNode: Node;
    private _blocksInChunkByPos: Map<number, Map<number, Map<number, Node>>> = new Map();

    get chunkNode(): Node {
        return this._chunkNode;
    }

    set chunkNode(value: Node) {
        this._chunkNode = value;
    }

    get blocksInChunkByPos(): Map<number, Map<number, Map<number, Node>>> {
        return this._blocksInChunkByPos;
    }

    set blocksInChunkByPos(value: Map<number, Map<number, Map<number, Node>>>) {
        this._blocksInChunkByPos = value;
    }

    // Получить блок
    getBlock(x: number, y: number, z: number): Node | undefined {
        return this._blocksInChunkByPos.get(y)?.get(x)?.get(z);
    }

    // Проверка на наличие блока
    hasBlock(x: number, y: number, z: number): boolean {
        return this._blocksInChunkByPos.get(y)?.get(x)?.has(z) ?? false;
    }

    // Удалить блок
    removeBlock(x: number, y: number, z: number): void {
        const yMap = this._blocksInChunkByPos.get(y);
        const xMap = yMap?.get(x);
        xMap?.delete(z);

        // Очистка пустых мап (по желанию)
        if (xMap?.size === 0) yMap?.delete(x);
        if (yMap?.size === 0) this._blocksInChunkByPos.delete(y);
    }

    // Перебор всех блоков (с callback)
    forEachBlock(callback: (block: Node, x: number, y: number, z: number) => void): void {
        for (const [y, yMap] of this._blocksInChunkByPos) {
            for (const [x, xMap] of yMap) {
                for (const [z, block] of xMap) {
                    callback(block, x, y, z);
                }
            }
        }
    }
}
