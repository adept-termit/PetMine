import {loadPrefab} from "db://assets/scripts/core/utils/ResourcesLoader";
import {_decorator, Button, Component, instantiate, Prefab,} from 'cc';

class GameFactory {
    createDynamite(prefab: Prefab) {
        return instantiate(prefab);
    }
}

export const gameFactory = new GameFactory();