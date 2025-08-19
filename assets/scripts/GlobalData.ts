import {BlockProvider} from "db://assets/scripts/biomes/BlockProvider";
import {SkinMap} from "db://assets/scripts/biomes/WorldData";


export type PickData = {
    id: string;
    name: string;
    price: number;
    damage: number;
};

export type PickaxeStats = {
    [id: string]: PickData;
};

export class GlobalData {
    private _triggerDestructionItems: boolean = false;
    private _triggerActivatePet: boolean = false;
    private _pickaxeStats: PickaxeStats = {};

    get pickaxeStats(): PickaxeStats {
        return this._pickaxeStats;
    }

    set pickaxeStats(value: PickaxeStats) {
        this._pickaxeStats = value;
    }

    get triggerDestructionItems(): boolean {
        return this._triggerDestructionItems;
    }

    get triggerActivatePet(): boolean {
        return this._triggerActivatePet;
    }

    set triggerDestructionItems(value: boolean) {
        this._triggerDestructionItems = value;
    }

    set triggerActivatePet(value: boolean) {
        this._triggerActivatePet = value;
    }
}


export const globalData = new GlobalData();