import {_decorator, Component, Node, Prefab, ScrollView, instantiate} from 'cc';
import {globalData, PickData} from "db://assets/scripts/GlobalData";

const {ccclass, property} = _decorator;

@ccclass('PickAxeTabUI')
export class PickAxeTabUI extends Component {
    @property({type: Prefab}) slotPrefab: Prefab = null!;
    @property({type: ScrollView}) scrollView: ScrollView = null!;


    init() {
        Object.entries(globalData.pickaxeStats).forEach(([id, data]: [string, PickData]) => {
            console.log(id, data);
        });




    }
    onLoad() {
        for (let i = 0; i < 50; ++i) {
            this.addPickSlot();
        }
    }

    addPickSlot() {
        this.scrollView.content!.addChild(instantiate(this.slotPrefab));
    }

    start() {

    }

    update(deltaTime: number) {

    }
}


