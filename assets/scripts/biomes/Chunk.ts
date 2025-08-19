import {
    _decorator,
    Component,
    Node,
    Prefab,
    Vec3,
    Pool,
    instantiate,
    Eventify,
    CCInteger,
    Collider,
    ITriggerEvent
} from 'cc';
import {Block} from "db://assets/scripts/biomes/block/Block";
import {poolService} from "db://assets/scripts/core/utils/PoolService";
import {blockProvider} from "db://assets/scripts/biomes/BlockProvider";
import {globalData} from "db://assets/scripts/GlobalData";

const {ccclass, property} = _decorator;

const directions = {
    up: new Vec3(0, 1, 0),
    down: new Vec3(0, -1, 0),
    left: new Vec3(-1, 0, 0),
    right: new Vec3(1, 0, 0),
    forward: new Vec3(0, 0, 1),
    backward: new Vec3(0, 0, -1)
}

export type Rarity = 'legendary' | 'rare' | 'common';
export type BiomesConfig = Record<string, BiomeData>;

export interface DepthSettings {
    legendary: number;
    rare: number;
}

export interface BiomeChances {
    legendary: number;
    rare: number;
    common: number;
}

export interface BiomeData {
    blocks: Record<Rarity, string[]>;
    depthSettings: DepthSettings;
    chances: BiomeChances;
}

@ccclass('Chunk')
export class Chunk extends Eventify(Component) {
    static readonly EVENT_BLOCK_DESTROY = 'chunk:block-destroyed';
    static readonly EVENT_FULL_CLEAR = 'chunk:full-clear';

    @property({type: Collider}) triggerDestructionItems: Collider;
    @property({type: Collider}) triggerActiveChunk: Collider;
    @property({type: Collider}) triggerActivatePet: Collider;

    @property(Node) chunkNode: Node;
    @property(Vec3) chunkSize: Vec3 = new Vec3(7, 20, 7);
    @property(Vec3) biomePos: Vec3 = new Vec3(0, 0, 0);
    @property(Node) blocksPrefab: Node;

    private _blocks: Block[][][] = [];
    private _totalBlocks = 0;

    biomeData: BiomeData;

    init() {
        this._totalBlocks = this.chunkSize.x * this.chunkSize.y * this.chunkSize.z;

        poolService.init(this.blocksPrefab);

        this.generate();
    }

    generate() {
        this.initArrayBlocks();

        for (let y = 0; y < this.chunkSize.y; y++) {
            for (let x = 0; x < this.chunkSize.x; x++) {
                for (let z = 0; z < this.chunkSize.z; z++) {

                    const blockNode = this.createBlockNode(x, y, z);
                    const block = blockNode.getComponent(Block);

                    block.on(Block.EVENT_DESTROY, this.onBlockDestroyed, this);

                    this.chunkNode.addChild(blockNode);

                    this._blocks[y][x][z] = block;
                }
            }
        }
    }

    private initArrayBlocks() {
        this._blocks = new Array(this.chunkSize.x);
        for (let y = 0; y < this.chunkSize.y; y++) {
            this._blocks[y] = new Array(this.chunkSize.x);

            for (let x = 0; x < this.chunkSize.x; x++) {
                this._blocks[y][x] = new Array(this.chunkSize.z).fill(null);
            }
        }
    }

    private createBlockNode(x: number, y: number, z: number): Node {

        const blockName: string = this.pickBlockNameByDepth(y);
        const blockNode = poolService.allocBlock(blockName);

        blockNode.setPosition(x, y, z);
        blockNode.active = y === this.chunkSize.y - 1;

        return blockNode;
    }

    private pickBlockNameByDepth(depth: number): string {
        const {depthSettings, blocks, chances} = this.biomeData;

        let availableRarities: Rarity[] = [];

        if (depth <= depthSettings.legendary) {
            availableRarities = ['legendary', 'rare', 'common'];
        } else if (depth <= depthSettings.rare) {
            availableRarities = ['rare', 'common'];
        } else {
            availableRarities = ['common'];
        }

        const filteredChances = availableRarities.map(rarity => ({
            rarity,
            chance: chances[rarity]
        }));

        const chosenRarity = this.pickByChance(filteredChances);

        return this.pickRandomBlock(blocks[chosenRarity]);
    }

    private pickByChance<T extends { rarity: string; chance: number }>(items: T[]): string {
        const total = items.reduce((sum, item) => sum + item.chance, 0);
        const rand = Math.random() * total;

        let cumulative = 0;
        for (const item of items) {
            cumulative += item.chance;
            if (rand <= cumulative) {
                return item.rarity;
            }
        }
        return items[items.length - 1].rarity;
    }

    private pickRandomBlock(blocks: string[]): string {
        return blocks[Math.floor(Math.random() * blocks.length)];
    }

    private onBlockDestroyed(block: Block) {
        const { x, y, z } = block.node.position;

        if (this.inBounds(x, y, z)) {
            this._blocks[y][x][z] = null;

            this.activateBlocksAround(x, y, z);
        }

        this.emit(Chunk.EVENT_BLOCK_DESTROY, block);

        block.off(Block.EVENT_DESTROY, this.onBlockDestroyed, this);

        block.node.removeFromParent();
        poolService.freeBlock(block.node.name, block.node);

        this._totalBlocks -= 1;

        if (this._totalBlocks < 1) {
            this.emit(Chunk.EVENT_FULL_CLEAR);
        }
    }

    private inBounds(x: number, y: number, z: number) {
        return x >= 0 && x < this.chunkSize.x && y >= 0 && y < this.chunkSize.y && z >= 0 && z < this.chunkSize.z;
    }

    private activateBlocksAround(x: number, y: number, z: number) {
        for (const dir of Object.values(directions)) {
            const nx = x + dir.x;
            const ny = y + dir.y;
            const nz = z + dir.z;

            const neighbor = this.getBlock(nx, ny, nz);

            if (neighbor) {
                neighbor.node.active = true;
            }
        }
    }

    private getBlock(x: number, y: number, z: number) {
        if (!this.inBounds(x, y, z)) return null;

        return this._blocks[y][x][z];
    }

    *blocks(): IterableIterator<Block> {
        for (let y = this.chunkSize.y - 1; y >= 0; y--) {
            for (let x = 0; x < this.chunkSize.x; x++) {
                for (let z = 0; z < this.chunkSize.z; z++) {
                    const block = this._blocks[y][x][z];

                    if (!block || !block.node.active || block.destroyed) continue;

                    yield block;
                }
            }
        }
    }

    getBlocksInRadius(worldPosition: Vec3, radius: number, blockScale: number = 1): Block[] {
        const result: Block[] = [];
        const localPos = new Vec3();

        this.chunkNode.inverseTransformPoint(localPos, worldPosition);

        const center = new Vec3(
            localPos.x / blockScale,
            localPos.y / blockScale,
            localPos.z / blockScale
        );

        console.log(center)

        const xMin = Math.max(0, Math.floor(center.x - radius));
        const xMax = Math.min(this.chunkSize.x - 1, Math.ceil(center.x + radius));

        const yMin = Math.max(0, Math.floor(center.y - radius));
        const yMax = Math.min(this.chunkSize.y - 1, Math.ceil(center.y + radius));

        const zMin = Math.max(0, Math.floor(center.z - radius));
        const zMax = Math.min(this.chunkSize.z - 1, Math.ceil(center.z + radius));

        for (let y = yMin; y <= yMax; y++) {
            for (let x = xMin; x <= xMax; x++) {
                for (let z = zMin; z <= zMax; z++) {
                    const block = this.getBlock(x, y, z);
                    if (!block || block.destroyed) continue;

                    console.log(x, y, z)

                    result.push(block);
                }
            }
        }

        return result;
    }

    onDisable() {
        this.triggerActiveChunk.off('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerActiveChunk.off("onTriggerExit", this._onTriggerExit, this);

        this.triggerDestructionItems.off('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerDestructionItems.off("onTriggerExit", this._onTriggerExit, this);

        this.triggerActivatePet.off('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerActivatePet.off("onTriggerExit", this._onTriggerExit, this);
    }

    onEnable() {
        this.triggerActiveChunk.on('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerActiveChunk.on("onTriggerExit", this._onTriggerExit, this);

        this.triggerDestructionItems.on('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerDestructionItems.on("onTriggerExit", this._onTriggerExit, this);

        this.triggerActivatePet.on('onTriggerEnter', this._onTriggerEnter, this);
        this.triggerActivatePet.on("onTriggerExit", this._onTriggerExit, this);
    }

    private _onTriggerEnter(event: ITriggerEvent) {

        const triggerName = event.selfCollider.node.name;

        if (triggerName === "Trigger Active Chunk") {
            console.log(this)
            blockProvider.setActiveChunk(this);
        }

        if (triggerName === "Trigger Destruction Item") {
            globalData.triggerDestructionItems = true;
        }

        if (triggerName === "Trigger Activate Pet") {
            console.log(true)
            globalData.triggerActivatePet = true;
        }
    }

    private _onTriggerExit(event: ITriggerEvent) {
        const triggerName = event.selfCollider.node.name;

        if (triggerName === "Trigger Destruction Item") {
            globalData.triggerDestructionItems = false;
        }

        if (triggerName === "Trigger Activate Pet") {
            console.log(false)
            globalData.triggerActivatePet = false;
        }
    }
}


























































