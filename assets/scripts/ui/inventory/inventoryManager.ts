import {Node} from 'cc';
import {InventoryItem} from "db://assets/scripts/ui/inventory/InventoryItem";

export class InventoryManager {
    private items: Map<string, InventoryItem> = new Map();

    addItem(item: InventoryItem) {
        this.items.set(item.name, item);
    }

    use(btn: Node) {
        const item = this.items.get(btn.name);
        if (item) {
            item.use();
        }
    }
}

export const inventoryManager = new InventoryManager();


