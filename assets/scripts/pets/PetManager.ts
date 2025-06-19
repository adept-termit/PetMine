import {_decorator, Component, instantiate, Node, Quat, Vec3} from 'cc';

import {loadJson, loadMesh, loadTexture2D} from "db://assets/scripts/core/utils/ResourcesLoader";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";
import {worldData} from "db://assets/scripts/biomes/WorldData";
import {PetController} from "db://assets/scripts/pets/PetController";
import {PetService} from "db://assets/scripts/pets/PetService";

const {ccclass, property} = _decorator;

const petHeightOffset = 0.5; // Высота, на которой будет летать питомец
const minDistance = 0.5; // Минимальная дистанция до персонажа

@ccclass('PetManager')
export class PetManager extends Component {
    @property(Node) abstructPetNode: Node;
    @property(Node) petsRoot: Node;

    private _target: Node;

    set target(value: Node) {
        this._target = value;
    }

    update(dt: number) {
        //this.followState(dt);
        this.mineState(dt);
    }

    async init() {
        const sortedPets = await this._getSortedSelectedPets();

        for (let i = 0; i < sortedPets.length; i++) {
            const petName = sortedPets[i].name;
            const newPetNode = await this._createPetNode(petName);
            const pos = this._positionPetNode(i, sortedPets.length);

            newPetNode.setPosition(pos)
            newPetNode.getComponent(PetController).localPosInPetsRoot = pos;

            this.petsRoot.addChild(newPetNode);

            newPetNode.active = true;
        }
    }

    private async _getSortedSelectedPets(): Promise<{ name: string, damage: number }[]> {
        const petData = await loadJson<{ data: { name: string; damage: number }[] }>('pets/petsData');
        const selectedPets = playerProgress.progress.selected.pets;

        return selectedPets
            .map(pet => {
                const data = petData.data.find(p => p.name === pet);
                return {
                    name: pet,
                    damage: data ? data.damage : 0
                };
            })
            .sort((a, b) => b.damage - a.damage);
    }

    private async _createPetNode(petName: string): Promise<Node> {
        const newPetNode = instantiate(this.abstructPetNode);
        newPetNode.name = petName;

        // const [mesh, texture] = await Promise.all([
        //     this._loadSkinMesh(petName),
        //     this._loadSkinTexture(petName)
        // ]);
        //
        // const meshRenderer = newPetNode.getComponent(MeshRenderer);
        // meshRenderer.mesh = mesh;
        // meshRenderer.material.setProperty('albedoMap', texture);

        return newPetNode;
    }

    private _positionPetNode(index: number, totalPets: number): Vec3 {
        const maxPerRow = 5;
        const offsetX = 0.7;
        const offsetZ = 1;

        const row = Math.floor(index / maxPerRow);
        const col = index % maxPerRow;

        // количество питомцев в этом ряду
        const petsInThisRow = Math.min(totalPets - row * maxPerRow, maxPerRow);

        // центрирование по X — сдвиг на половину ширины ряда
        const startX = -(petsInThisRow - 1) * offsetX / 2;

        return new Vec3(startX + col * offsetX, 0, -row * offsetZ);
    }

    private followState(dt: number) {
        if (!this._target) return;

        const currentPos = this.petsRoot.getWorldPosition();
        const targetPos = this._target.getWorldPosition().clone();
        targetPos.y += petHeightOffset;

        const distance = Vec3.distance(currentPos, targetPos);

        const direction = new Vec3();
        Vec3.subtract(direction, targetPos, currentPos);
        direction.normalize();

        const targetRotation = new Quat();
        Quat.fromViewUp(targetRotation, direction, Vec3.UP);

        const smoothedRotation = new Quat();
        Quat.rotateTowards(smoothedRotation, this.petsRoot.getWorldRotation(), targetRotation, 720 * dt);

        const smoothedPosition = new Vec3();
        if (distance > minDistance) {
            Vec3.lerp(smoothedPosition, currentPos, targetPos, 2 * dt);
        } else {
            smoothedPosition.set(currentPos);
        }

        this.petsRoot.setWorldRotation(smoothedRotation);
        this.petsRoot.setWorldPosition(smoothedPosition);
    }

    private async _loadSkinMesh(skinName: string) {
        const path = `pets/meshes/${skinName}`;

        return await loadMesh(path);
    }

    private async _loadSkinTexture(skinName: string) {
        const path = `pets/textures/${skinName}/texture`;

        return await loadTexture2D(path);
    }

    private mineState(dt: number) {
        const chunkData = worldData.chunkBiomeDictionary.get(worldData.currentBiome)
        console.log(chunkData)
        this.petsRoot.children.forEach(petNode => {
            const petController = petNode.getComponent(PetController);

            if (petController.target) {
                return
            }
            const blocks = chunkData.blocksInChunkByPos;

            console.log(blocks)
            // Итерируем по всем уровням Y в порядке убывания
            const yKeys = Array.from(blocks.keys()).sort((a, b) => b - a);
            for (const y of yKeys) {
                const xMap = blocks.get(y);
                if (!xMap) continue;

                const xKeys = Array.from(xMap.keys()).sort((a, b) => b - a);
                for (const x of xKeys) {
                    const zMap = xMap.get(x);
                    if (!zMap) continue;

                    const zKeys = Array.from(zMap.keys()).sort((a, b) => b - a);
                    for (const z of zKeys) {
                        const block = zMap.get(z);

                        const blockKey = this.getBlockKey(x, y, z);

                        if (!block) {
                            PetService.targetedBlocks.delete(blockKey);
                            continue;
                        }

                        if (PetService.targetedBlocks.has(blockKey)) continue;

                        PetService.targetedBlocks.add(blockKey); // пометить как занятый
                        console.log(1212)
                        petController.target = block;

                        return;
                    }
                }
            }
        });
    }

    // Утилита для генерации ключа
    private getBlockKey(x: number, y: number, z: number): string {
        return `${x}:${y}:${z}`;
    }
}




