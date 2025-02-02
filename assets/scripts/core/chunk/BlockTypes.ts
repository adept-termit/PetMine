import {_decorator} from 'cc';
import {BlockType} from "db://assets/scripts/core/chunk/world";
import * as cc from "cc";

const {ccclass, property} = _decorator;

@ccclass('BlockTypes')
export class BlockTypes {
    @property({type: cc.Enum(BlockType)}) BlockType: BlockType
}