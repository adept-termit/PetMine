import {_decorator, Node, Vec2, Vec3, instantiate, director} from 'cc';
import {BiomeType, worldData} from "db://assets/scripts/core/chunk/world";
import {ChunkData} from "db://assets/scripts/core/chunk/ChunkData";
import {TBlocks} from "db://assets/scripts/core/chunk/BiomeGenerator";

const {ccclass} = _decorator;

@ccclass('BlockCreator')
export class BlockCreator {
    private triangles: number[] = [];
    private vertices: Vec3[] = [];
    private uv: Vec2[] = [];
    private _chunkData: ChunkData;

    init(biomeType: BiomeType) {
        this.triangles = [];
        this.vertices = [];
        this.uv = [];

        this._chunkData = worldData.chunkBiomeDictionary.get(biomeType);
    }

    createGeometry() {
        return {
            dynamicGeometryOptions: {
                maxSubMeshes: 10,
                maxSubMeshVertices: 100000,
                maxSubMeshIndices: 100000
            },
            dynamicGeometry: {
                positions: new Float32Array(this.vertices.flatMap(vertex => [vertex.x, vertex.y, vertex.z])),
                indices16: new Uint16Array(this.triangles),
                uvs: new Float32Array(this.uv.flatMap(vertex => [vertex.x, vertex.y])),
            }
        }
    }

    instanceBlock(foundBlock: TBlocks, poolExistBlock: Node) {

        const blockId = poolExistBlock.getChildByName(foundBlock.id);

        let block = instantiate(blockId);
        const customPos = foundBlock.position.add(new Vec3(0.5, 0.5, 0.5))
        block.name = customPos.toString();
        block.setPosition(customPos)
        blockId.active = true;
        console.log(block.name)

        return block
    }

    createBlockMesh(blockPosition: Vec3, x: number, y: number, z: number, sad: boolean) {
        if (this.getBlockAtPosition(x + 1, y, z) == 0) {
            this.generateRightSide(blockPosition)
            this.addVertex()
            if (sad != true) {
                this.addUv(blockPosition)
            }
        }

        if (this.getBlockAtPosition(x - 1, y, z) == 0) {
            this.generateLeftSide(blockPosition)
            this.addVertex()
            if (sad != true) {
                this.addUv(blockPosition)
            }
        }
        if (this.getBlockAtPosition(x, y, z - 1) == 0) {
            this.generateBackSide(blockPosition)
            this.addVertex()
            if (sad != true) {
                this.addUv(blockPosition)
            }
        }
        if (this.getBlockAtPosition(x, y, z + 1) == 0) {
            this.generateFrontSide(blockPosition)
            this.addVertex()
            if (sad != true) {
                this.addUv(blockPosition)
            }
        }
        if (this.getBlockAtPosition(x, y + 1, z) == 0) {
            this.generateTopSide(blockPosition)
            this.addVertex()
            if (sad != true) {
                this.addUv(blockPosition)
            }
        }
        if (this.getBlockAtPosition(x, y - 1, z) == 0) {
            this.generateBottomSide(blockPosition)
            this.addVertex()
            if (sad != true) {
                this.addUv(blockPosition)
            }
        }
    }

    private addVertex(): void {
        const len = this.vertices.length;
        this.triangles.push(len - 4, len - 3, len - 2, len - 3, len - 1, len - 2);
    }

    private addUv(blockPosition: Vec3): void {
        const block = this._chunkData.blocksDictionary.get(blockPosition.toString());

        if (block === undefined) {
            console.log(blockPosition.toString())
        } else {
            const x = block.uvTexture[0]; // Позиция блока по X
            const y = block.uvTexture[1]; // Позиция блока по Y

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
    }

    private getBlockAtPosition(x: number, y: number, z: number): number {
        if (
            x >= 0 && x < this._chunkData.chunkSize &&
            y >= 0 && y < this._chunkData.chunkSizeHeight &&
            z >= 0 && z < this._chunkData.chunkSize
        ) {

            const findBlock = this._chunkData.blocksDictionary.get(new Vec3(x, y, z).toString());

            if (findBlock === undefined) {
                console.log(new Vec3(x, y, z))
                return 0
            } else {
                return 1
            }
        } else {
            return 0;
        }
    }

    private generateRightSide(blockPosition: Vec3): void {
        this.vertices.push(
            new Vec3(1, 1, 1).add(blockPosition), // верхний правый задний угол
            new Vec3(1, 0, 1).add(blockPosition), // нижний правый задний угол
            new Vec3(1, 1, 0).add(blockPosition), // верхний левый задний угол
            new Vec3(1, 0, 0).add(blockPosition), // нижний левый задний угол
        );
    }

    private generateLeftSide(blockPosition: Vec3): void {
        this.vertices.push(
            new Vec3(0, 1, 0).add(blockPosition), // верхний правый задний угол
            new Vec3(0, 0, 0).add(blockPosition), // нижний правый задний угол
            new Vec3(0, 1, 1).add(blockPosition), // верхний левый задний угол
            new Vec3(0, 0, 1).add(blockPosition), // нижний левый задний угол
        );
    }

    private generateFrontSide(blockPosition: Vec3): void {
        this.vertices.push(
            new Vec3(0, 1, 1).add(blockPosition), // верхний правый задний угол
            new Vec3(0, 0, 1).add(blockPosition), // нижний правый задний угол
            new Vec3(1, 1, 1).add(blockPosition), // верхний левый задний угол
            new Vec3(1, 0, 1).add(blockPosition), // нижний левый задний угол
        );
    }

    private generateBackSide(blockPosition: Vec3): void {
        this.vertices.push(
            new Vec3(1, 1, 0).add(blockPosition), // верхний правый задний угол
            new Vec3(1, 0, 0).add(blockPosition), // нижний правый задний угол
            new Vec3(0, 1, 0).add(blockPosition), // верхний левый задний угол
            new Vec3(0, 0, 0).add(blockPosition), // нижний левый задний угол
        );
    }

    private generateTopSide(blockPosition: Vec3): void {
        this.vertices.push(
            new Vec3(0, 1, 0).add(blockPosition), // верхний правый задний угол
            new Vec3(0, 1, 1).add(blockPosition), // нижний правый задний угол
            new Vec3(1, 1, 0).add(blockPosition), // верхний левый задний угол
            new Vec3(1, 1, 1).add(blockPosition), // нижний левый задний угол
        );
    }

    private generateBottomSide(blockPosition: Vec3): void {
        this.vertices.push(
            new Vec3(0, 0, 1).add(blockPosition), // верхний правый задний угол
            new Vec3(0, 0, 0).add(blockPosition), // нижний правый задний угол
            new Vec3(1, 0, 1).add(blockPosition), // верхний левый задний угол
            new Vec3(1, 0, 0).add(blockPosition), // нижний левый задний угол
        );
    }
}

export const blockCreator = new BlockCreator();
