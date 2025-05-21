import {_decorator, Node, Pool, instantiate} from 'cc';

const {ccclass} = _decorator;

@ccclass('PoolService')
export class PoolService {
    private pools: Map<string, Pool<Node>> = new Map();

    /** Инициализация пулов */
    init(typeBlocks: Node, poolSize: number = 50) {
        typeBlocks.children.forEach((typeBlock: Node) => {
            const pool = new Pool<Node>(
                () => instantiate(typeBlock),
                poolSize,
                (block: Node) => {
                    block.setPosition(0, 0, 0);
                    block.active = false;
                }
            );

            this.pools.set(typeBlock.name, pool);
        });

    }

    /** Получить пул по имени блока */
    public getPool(blockType: string): Pool<Node> | undefined {
        return this.pools.get(blockType);
    }

    /** Выделить блок из пула */
    public allocBlock(blockType: string): Node {
        const pool = this.getPool(blockType);
        return pool.alloc();
    }

    /** Вернуть блок в пул */
    public freeBlock(blockType: string, block: Node): void {
        const pool = this.getPool(blockType);
        pool.free(block);
    }
}

export const poolService = new PoolService();