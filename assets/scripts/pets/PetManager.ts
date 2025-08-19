import {_decorator, Component, instantiate, Node, Quat, Vec3} from 'cc';

import {loadJson, loadMesh, loadTexture2D} from "db://assets/scripts/core/utils/ResourcesLoader";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";
import {Pet} from "db://assets/scripts/pets/Pet";

const {ccclass, property} = _decorator;

@ccclass('PetManager')
export class PetManager extends Component {
    @property(Node) abstructPetNode: Node;

    private _target: Node;

    set target(value: Node) {
        this._target = value;
    }

    async init() {
        const sortedPets = await this._getSortedSelectedPets();

        for (let i = 0; i < sortedPets.length; i++) {
            const petName = sortedPets[i].name;
            const petNode = await this._createPetNode(petName);
            const pos = this._positionPetNode(i, sortedPets.length);
            const petComponent = petNode.getComponent(Pet);

            petNode.setPosition(pos)
            petComponent.characterNode = this._target;

            petComponent.followOffset = pos.clone();
            petNode.active = true;

            this.node.addChild(petNode);
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
        const petNode = instantiate(this.abstructPetNode);
        petNode.name = petName;

        // const [mesh, texture] = await Promise.all([
        //     this._loadSkinMesh(petName),
        //     this._loadSkinTexture(petName)
        // ]);
        //
        // const meshRenderer = petNode.getComponent(MeshRenderer);
        // meshRenderer.mesh = mesh;
        // meshRenderer.material.setProperty('albedoMap', texture);

        return petNode;
    }

    private _positionPetNode(index: number, totalPets: number): Vec3 {
        const maxPerRow = 4;
        const radius = 1.5; // Расстояние от персонажа до питомцев (радиус окружности)
        const angleSpread = Math.PI / 3; // Угол расстановки питомцев (в радианах) — 60°
        const rowOffsetZ = 0.6; // Сдвиг по Z для следующего ряда питомцев (отдаление назад)
        const row = Math.floor(index / maxPerRow); // Определение строки (ряда) питомца на основе его индекса и количества в ряду
        const col = index % maxPerRow; // Определение позиции в ряду (номер колонки)
        const petsInRow = Math.min(totalPets - row * maxPerRow, maxPerRow); // Определяем, сколько питомцев находится в текущем ряду
        const angleStep = petsInRow > 1 ? angleSpread / (petsInRow - 1) : 0; // Шаг между углами для текущего ряда (если больше одного питомца в ряду)
        const startAngle = -angleSpread / 2; // Начальный угол для первого питомца в ряду (отрицательное значение — влево)
        const angle = startAngle + angleStep * col; // Угол текущего питомца внутри своего ряда
        const x = Math.sin(angle) * radius; // Вычисляем позицию X — по синусу угла и радиусу
        const z = -Math.cos(angle) * radius - row * rowOffsetZ; // Вычисляем позицию Z — по косинусу (минус, чтобы питомцы были "за" персонажем), и добавляем отступ назад для следующего ряда

        return new Vec3(x, 0.5, z);
    }

    private async _loadSkinMesh(skinName: string) {
        const path = `pets/meshes/${skinName}`;

        return await loadMesh(path);
    }

    private async _loadSkinTexture(skinName: string) {
        const path = `pets/textures/${skinName}/texture`;

        return await loadTexture2D(path);
    }
}




