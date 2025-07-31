import {BlockProvider} from "db://assets/scripts/biomes/BlockProvider";

export class GlobalData {
    private _triggerDestructionItems: boolean = false;
    private _triggerActivatePet: boolean = false;

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