import {_decorator, Button, Component, Node, Prefab} from 'cc';
import {inventoryManager} from "db://assets/scripts/ui/inventory/inventoryManager";

const {ccclass, property} = _decorator;

@ccclass('InventoryUI')
export class InventoryUI extends Component {
    @property([Node]) buttons: Node[] = [];

    onEnable() {
        this.buttons.forEach((button, index) => {
            button.on(Button.EventType.CLICK, () => this.onUseClick(button), this);
        });
    }

    private onUseClick(btn:Node) {
        inventoryManager.use(btn);
    }
}


