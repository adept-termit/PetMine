import {_decorator, Button, Component, director, instantiate, Prefab,} from 'cc';

import {InventoryItem} from "db://assets/scripts/ui/inventory/InventoryItem";
import {gameFactory} from "db://assets/scripts/core/utils/GameFactory";
import {Character} from "db://assets/scripts/character/Character";

export class DynamiteItem implements InventoryItem {
    name = '123';

    private dynamitePrefab: Prefab;

    constructor(prefab: Prefab) {
        this.dynamitePrefab = prefab;
    }

    use(): void {
        const dynamiteNode = gameFactory.createDynamite(this.dynamitePrefab);
        dynamiteNode.setWorldPosition(director.getScene().getComponentsInChildren(Character)[0].node.getWorldPosition())
        director.getScene().addChild(dynamiteNode)
    }
}
