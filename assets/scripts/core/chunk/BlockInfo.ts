import {_decorator, Vec3} from 'cc';

import {BlockPriceType, BlockType} from "db://assets/scripts/core/chunk/world";

const {ccclass} = _decorator;

@ccclass('BlockInfo')
export class BlockInfo {
    private _blockPos: Vec3;
    private _blockType: BlockType;
    private _priceType: BlockPriceType;
    private _price: number;
    private _hp: number;
    private _chanceToDropCrystal: number;

    get blockPos(): Vec3 {
        return this._blockPos;
    }

    set blockPos(value: Vec3) {
        this._blockPos = value;
    }

    get blockType(): BlockType {
        return this._blockType;
    }

    set blockType(value: BlockType) {
        this._blockType = value;
    }

    get priceType(): BlockPriceType {
        return this._priceType;
    }

    set priceType(value: BlockPriceType) {
        this._priceType = value;
    }

    get price(): number {
        return this._price;
    }

    set price(value: number) {
        this._price = value;
    }

    get hp(): number {
        return this._hp;
    }

    set hp(value: number) {
        this._hp = value;
    }

    get chanceToDropCrystal(): number {
        return this._chanceToDropCrystal;
    }

    set chanceToDropCrystal(value: number) {
        this._chanceToDropCrystal = value;
    }
}
