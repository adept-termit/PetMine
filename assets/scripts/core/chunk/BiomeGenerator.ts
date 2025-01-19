import {
    _decorator,
    Camera,
    CCInteger,
    Component,
    director,
    EventMouse,
    geometry,
    Input,
    input,
    instantiate,
    MeshCollider,
    MeshRenderer,
    Node,
    PhysicsSystem,
    primitives,
    utils,
    Vec2,
    Vec3,
    LineComponent, CurveRange, GradientRange, math
} from 'cc';

import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";

const {ccclass, property} = _decorator;

@ccclass('BiomeGenerator')
export class BiomeGenerator extends Component {
    @property({type: Node}) block: Node;
    @property({type: Node}) sphere: Node;
    @property({type: Camera}) camera: Camera;
    @property({type: Vec3}) chunkPosSpawn: Vec3 = new Vec3(0, 0, 0);

    @property({type: CCInteger}) countChunk: number = 2;
    @property({type: CCInteger}) chunkSizeWidth: number = 7;
    @property({type: CCInteger}) chunkSizeHeight: number = 5;

    private _block: Node;
    private _chunkDataDictionary: Map<number, ChunkData> = new Map();
    private _dynamicGeometry: primitives.IDynamicGeometry;
    private _dynamicGeometryOptions: primitives.ICreateDynamicMeshOptions;

    private triangles: number[] = [];
    private vertices: Vec3[] = [];
    private uv: Vec2[] = [];
    private _chunkData?: ChunkData | null

    private _ray: geometry.Ray = new geometry.Ray();

    onEnable() {
        input.on(Input.EventType.MOUSE_DOWN, this._onKeyDown, this);
    }

    onDisable() {
        input.off(Input.EventType.MOUSE_DOWN, this._onKeyDown, this);
    }

    onLoad() {

        for (let i = 0; i < this.countChunk; i++) {

            this.generateChunk(i);
            this.createGeometry();

            this._block.getComponent(MeshRenderer).mesh = utils.MeshUtils.createDynamicMesh(
                0,
                this._dynamicGeometry,
                undefined,
                this._dynamicGeometryOptions
            );

            this._block.getComponent(MeshCollider).mesh = this._block.getComponent(MeshRenderer).mesh;

            this.uv = [];
            this.vertices = [];
            this.triangles = [];
            this._chunkData = null;
        }
    }

    private generateChunk(chunkNumber: number): void {

        this._chunkData = new ChunkData();

        this._chunkData.chunkPos = new Vec3(
            this.chunkPosSpawn.x,
            this.chunkPosSpawn.y + chunkNumber * this.chunkSizeHeight,
            this.chunkPosSpawn.z
        )

        this.createBlock(this._chunkData.chunkPos);

        for (let y = 0; y < this.chunkSizeHeight; y++) {
            for (let x = 0; x < this.chunkSizeWidth; x++) {
                for (let z = 0; z < this.chunkSizeWidth; z++) {
                    // if (x ==1 && y == 1 && z == 1) {
                    //     continue;
                    // }

                    this._chunkData.blocks.push(new Vec3(x, y, z))
                    this.generateBlock(x, y, z, chunkNumber);
                }
            }
        }

       // console.log(this._chunkData.blocks)
        //chunk biome
        const chunkBiome = 1;
        this._chunkDataDictionary.set(chunkBiome, this._chunkData)
    }

    private createBlock(pos: Vec3): void {
        this._block = instantiate(this.block);
        this._block.setPosition(pos)

        director.getScene().addChild(this._block)
    }

    private getBlockAtPosition(x: number, y: number, z: number): number {
        if (
            x >= 0 && x < this.chunkSizeWidth &&
            y >= 0 && y < this.chunkSizeHeight &&
            z >= 0 && z < this.chunkSizeWidth
        ) {

            const blockIndex =  this._chunkData.blocks.find(block =>
                block.x === x && block.y === y && block.z === z
            );

            if (blockIndex === undefined) {
                return 0
            }else{
                return 1
            }
        } else {
            return 0;
        }
    }

    private generateBlock(x: number, y: number, z: number, chunkNumber: number): void {
        const blockPosition = new Vec3(x, y, z);

        if (this.getBlockAtPosition(x + 1, y, z) == 0) {
            this.generateRightSide(blockPosition, chunkNumber)
        }
        if (this.getBlockAtPosition(x - 1, y, z) == 0) {
            this.generateLeftSide(blockPosition, chunkNumber)
        }
        if (this.getBlockAtPosition(x, y, z - 1) == 0) {
            this.generateBackSide(blockPosition, chunkNumber)
        }
        if (this.getBlockAtPosition(x, y, z + 1) == 0) {
            this.generateFrontSide(blockPosition, chunkNumber)
        }
        if (this.getBlockAtPosition(x, y + 1, z) == 0) {
            this.generateTopSide(blockPosition, chunkNumber)
        }
        if (this.getBlockAtPosition(x, y - 1, z) == 0) {
            this.generateBottomSide(blockPosition, chunkNumber)
        }
    }

    private generateRightSide(blockPosition: Vec3, chunkNumber: number): void {
        this.vertices.push(
            new Vec3(1, 1, 1).add(blockPosition),
            new Vec3(1, 0, 1).add(blockPosition),
            new Vec3(1, 1, 0).add(blockPosition),
            new Vec3(1, 0, 0).add(blockPosition),
        );

        this.addVerticesToTriangles(chunkNumber);
    }

    private generateLeftSide(blockPosition: Vec3, chunkNumber: number): void {
        this.vertices.push(
            new Vec3(0, 1, 0).add(blockPosition),
            new Vec3(0, 0, 0).add(blockPosition),
            new Vec3(0, 1, 1).add(blockPosition),
            new Vec3(0, 0, 1).add(blockPosition)
        );

        this.addVerticesToTriangles(chunkNumber);
    }

    private generateFrontSide(blockPosition: Vec3, chunkNumber: number): void {
        this.vertices.push(
            new Vec3(0, 1, 1).add(blockPosition),
            new Vec3(0, 0, 1).add(blockPosition),
            new Vec3(1, 1, 1).add(blockPosition),
            new Vec3(1, 0, 1).add(blockPosition),
        );

        this.addVerticesToTriangles(chunkNumber);
    }

    private generateBackSide(blockPosition: Vec3, chunkNumber: number): void {
        this.vertices.push(
            new Vec3(1, 1, 0).add(blockPosition), // верхний правый задний угол
            new Vec3(1, 0, 0).add(blockPosition), // нижний правый задний угол
            new Vec3(0, 1, 0).add(blockPosition), // верхний левый задний угол
            new Vec3(0, 0, 0).add(blockPosition),  // нижний левый задний угол
        );

        this.addVerticesToTriangles(chunkNumber);
    }

    private generateTopSide(blockPosition: Vec3, chunkNumber: number): void {
        this.vertices.push(
            new Vec3(0, 1, 0).add(blockPosition),
            new Vec3(0, 1, 1).add(blockPosition),
            new Vec3(1, 1, 0).add(blockPosition),
            new Vec3(1, 1, 1).add(blockPosition)
        );

        this.addVerticesToTriangles(chunkNumber);
    }

    private generateBottomSide(blockPosition: Vec3, chunkNumber: number): void {
        this.vertices.push(
            new Vec3(0, 0, 1).add(blockPosition),
            new Vec3(0, 0, 0).add(blockPosition),
            new Vec3(1, 0, 1).add(blockPosition),
            new Vec3(1, 0, 0).add(blockPosition),
        );

        this.addVerticesToTriangles(chunkNumber);
    }

    private addVerticesToTriangles(chunkNumber: number): void {
        const len = this.vertices.length;

        this.triangles.push(len - 4, len - 3, len - 2, len - 3, len - 1, len - 2);

        const x = chunkNumber * 2 - 1; // Позиция блока по X
        const y = chunkNumber * 2; // Позиция блока по Y

        const size = 128; // Размер блока в пикселях
        const textureSize = 1024; // Размер текстуры

        const minU = (x * size) / textureSize;
        const maxU = ((x + 1) * size) / textureSize;
        const minV = (y * size) / textureSize;
        const maxV = ((y + 1) * size) / textureSize;

        this.uv.push(
            new Vec2(minU, minV),
            new Vec2(minU, maxV),
            new Vec2(maxU, minV),
            new Vec2(maxU, maxV)
        )

    }

    private createGeometry() {
        this._dynamicGeometryOptions = {
            maxSubMeshes: 1,
            maxSubMeshVertices: 10000,
            maxSubMeshIndices: 10000
        }

        this._dynamicGeometry = {
            positions: new Float32Array(this.vertices.flatMap(vertex => [vertex.x, vertex.y, vertex.z])),
            indices16: new Uint16Array(this.triangles),
            uvs: new Float32Array(this.uv.flatMap(vertex => [vertex.x, vertex.y])),
        }
    }

    private _onKeyDown(event: EventMouse) {


        if (event.getButton() === EventMouse.BUTTON_LEFT) {

            this.camera.screenPointToRay(event.getLocationX(), event.getLocationY(), this._ray);

            if (PhysicsSystem.instance.raycast(this._ray)) {
                const raycastResults = PhysicsSystem.instance.raycastResults;
                for (let i = 0; i < raycastResults.length; i++) {
                    const item = raycastResults[i];

                    const hitPoint = item.hitPoint;

                    this.spawnSfere(hitPoint);

                    const localHitPoint = new Vec3();
                    this._block.inverseTransformPoint(localHitPoint, hitPoint);
                    console.log(hitPoint)
                    console.log(localHitPoint)

                    const blockWidth = 1;
                    const blockHeight = 1;

                    const blockX = Math.floor(localHitPoint.x / blockWidth);
                    const blockY = Math.floor(localHitPoint.y / blockHeight);
                    const blockZ = Math.floor(localHitPoint.z / blockWidth);

                    console.log(`${blockX}, ${blockY}, ${blockZ}`);


                    //
                    // V2
                    // const worldOffset = hitPoint.subtract(this.chunkPosSpawn);
                    //
                    // const chunkIndexX = Math.floor(worldOffset.x / (this.chunkSizeWidth * this.countChunk));
                    // const chunkIndexY = Math.floor(worldOffset.y / (this.chunkSizeHeight * this.countChunk));
                    // const chunkIndexZ = Math.floor(worldOffset.z / (this.chunkSizeWidth * this.countChunk));
                    //
                    // const blockSize = 1;
                    // const blockX = Math.floor(localX / blockSize);
                    // const blockY = Math.floor(localY / blockSize);
                    // const blockZ = Math.floor(localZ / blockSize);
                    //
                    //   console.log(`${blockX}, ${blockY}, ${blockZ}`);

                    break;
                }
            }
        }
    }

    private spawnSfere(endPos: Vec3): void {
        this.sphere = instantiate(this.sphere);
        this.sphere.setPosition(endPos)
        director.getScene().addChild(this.sphere);
    }
}


