import {_decorator, Component, instantiate, Node, Pool, Quat, Vec3} from 'cc';

import {BiomeType, worldData} from "db://assets/scripts/core/chunk/world";
import {settings} from "db://assets/scripts/core/pet/Settings";

const {ccclass, property} = _decorator;

const enum PetState {
    Following,
    Mining
}

// Создаем временные векторы и кватернион
const tempVec3 = new Vec3();
const tempQuat = new Quat();

const petHeightOffset = 0.5; // Высота, на которой будет летать питомец
const minDistance = 0.5; // Минимальная дистанция до персонажа

@ccclass('Follow')
export class Follow extends Component {
    @property(Node) target: Node; // Цель, за которой следует питомец (персонаж)

    private _state = PetState.Mining;
    private pets: number;
    private inProcess = [];
    private blocks = [];

    start() {
        this.pets = this.node.children.length;
        let biome = worldData.chunkBiomeDictionary.get(BiomeType.Forest);
        this.blocks = biome.blocks;

        // this.node.children.forEach(petNode => {
        //     const entityName = petNode.name;
        //     const damage = petNode.getComponent(settings).damage;
        //     const checkEntity = this.inProcess.find(entity => entity.id === entityName);
        //     if (checkEntity) return;
        //
        //     for (let y = this.blocks.length - 1; y >= 0; y--) {
        //         if (!this.blocks[y]) continue;
        //         for (let x = this.blocks[y].length - 1; x >= 0; x--) {
        //             if (!this.blocks[y][x]) continue;
        //             for (let z = this.blocks[y][x].length - 1; z >= 0; z--) {
        //                 if (this.blocks[y][x][z]) {
        //                     console.log(this.blocks[y][x][z])
        //                     const obj = {id: entityName, petDamage: damage, y: y, x: x, z: z};
        //                     this.inProcess.push(obj)
        //                     this.blocks[y][x].splice(z, 1);
        //                     Vec3.lerp(tempVec3, petNode.worldPosition, new Vec3(x,y,z), 2 * dt); // Плавное приближение к цели
        //                     return;
        //                 }
        //             }
        //         }
        //     }
        // });


        this.inProcess.forEach(petNode => {
        })


    }

    update(dt: number) {
        switch (this._state) {
            case PetState.Following: {
                this.followState(dt);
                break;
            }
            case PetState.Mining: {
                this.miningState(dt);
                break;
            }
        }
    }

    private miningState(dt: number) {

        if (!this.pets) return

        const chunkData = worldData.chunkBiomeDictionary.get(BiomeType.Forest);

        this.node.children.forEach(petNode => {
            const entityName = petNode.name;
            const damage = petNode.getComponent(settings).damage;
            const checkEntity = this.inProcess.find(entity => entity.id === entityName);
            if (checkEntity) return;

            for (let y = this.blocks.length - 1; y >= 0; y--) {
                if (!this.blocks[y]) continue;
                for (let x = this.blocks[y].length - 1; x >= 0; x--) {
                    if (!this.blocks[y][x]) continue;
                    for (let z = this.blocks[y][x].length - 1; z >= 0; z--) {
                        const block = this.blocks[y][x][z]
                        if (block) {
                            const obj = {id: entityName, node: block, damage};

                            this.inProcess.push(obj)
                            this.blocks[y][x].splice(z, 1);

                            let pos = block.getWorldPosition().clone()

                            petNode.setPosition(pos.add(new Vec3(0.5, 0.5, 0.5)));

                            return;
                        }
                    }
                }
            }
        });


    }

    private followState(dt: number) {
        const currentPos: Vec3 = this.node.worldPosition;   // Получаем текущую позицию питомца

        // Получаем позицию персонажа и поднимаем цель на petHeightOffset
        let targetPos: Vec3 = this.target.worldPosition.clone();
        targetPos.y = targetPos.y + petHeightOffset;

        const distance = Vec3.distance(currentPos, targetPos); // Вычисляем расстояние между питомцем и персонажем
        const direction: Vec3 = tempVec3.set(currentPos).subtract(targetPos).normalize(); // Определяем направление к цели
        const targetRotation = Quat.fromViewUp(tempQuat, direction); // Рассчитываем желаемый поворот питомца в сторону цели

        Quat.rotateTowards(tempQuat, this.node.rotation, targetRotation, 720 * dt); // Плавно поворачиваем питомца в сторону цели со скоростью 720 градусов в секунду

        // Если питомец находится дальше минимальной дистанции, двигаемся к цели
        if (distance > minDistance) {
            Vec3.lerp(tempVec3, currentPos, targetPos, 2 * dt); // Плавное приближение к цели
        } else {
            tempVec3.set(currentPos); // Останавливаемся
        }

        this.node.setRTS(tempQuat, tempVec3); // Устанавливаем новую позицию и поворот питомца
    }
}
