import {_decorator, Vec3,Node} from 'cc';

import {BlockPriceType, BlockTypeId} from "db://assets/scripts/core/chunk/world";

const {ccclass} = _decorator;

@ccclass('BlockInfo')
export class BlockInfo {
    private _blockPos: Vec3;
    private _blockCustomPos: Vec3;
    private _priceType: BlockPriceType;
    private _price: number;
    private _hp: number;
    private _alreadyWasHit: boolean;
    private _chanceToDropCrystal: number;
    private _blockId: BlockTypeId;
    private _blockNode: Node;

    get alreadyWasHit(): boolean {
        return this._alreadyWasHit;
    }

    set alreadyWasHit(value: boolean) {
        this._alreadyWasHit = value;
    }

    get blockNode(): Node {
        return this._blockNode;
    }

    set blockNode(value: Node) {
        this._blockNode = value;
    }

    get blockCustomPos(): Vec3 {
        return this._blockCustomPos;
    }

    set blockCustomPos(value: Vec3) {
        this._blockCustomPos = value;
    }

    get blockPos(): Vec3 {
        return this._blockPos;
    }

    set blockPos(value: Vec3) {
        this._blockPos = value;
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

    get blockId(): BlockTypeId {
        return this._blockId;
    }

    set blockId(value: BlockTypeId) {
        this._blockId = value;
    }
}
