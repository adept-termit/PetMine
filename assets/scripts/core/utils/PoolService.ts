import { _decorator, Node, Pool, instantiate } from 'cc';

const { ccclass } = _decorator;

@ccclass('PoolService')
export class PoolService {
    private _pools: Map<string, Pool<Node>> = new Map();

    /**
     * Получить все пулы
     */
    allPools(): Map<string, Pool<Node>> {
        return this._pools;
    }

}

export const poolService = new PoolService();