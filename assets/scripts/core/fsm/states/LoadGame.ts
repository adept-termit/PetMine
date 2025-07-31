import {director, Node, Scene, Vec3} from "cc";

import {IState} from "db://assets/scripts/core/fsm/IState";
import {GameManager} from "db://assets/scripts/core/fsm/GameManager";
import {loadAndInstantiatePrefab, loadJson, loadPrefab} from "db://assets/scripts/core/utils/ResourcesLoader";
import {Character} from "db://assets/scripts/character/Character";
import {orbit} from "db://assets/scripts/camera/orbit";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";
import {PetManager} from "db://assets/scripts/pets/PetManager";
import {BiomesConfig, Chunk} from "db://assets/scripts/biomes/Chunk";
import {blockProvider} from "db://assets/scripts/biomes/BlockProvider";
import {DynamiteItem} from "db://assets/scripts/ui/inventory/item/DynamiteItem";
import {inventoryManager} from "db://assets/scripts/ui/inventory/inventoryManager";
import {gameFactory} from "db://assets/scripts/core/utils/GameFactory";

export class LoadGame implements IState {
    private gameManager: GameManager;
    private _scene: Scene;

    characterNode: Node;

    constructor(game: GameManager) {
        this.gameManager = game;
        this._scene = director.getScene();
    }

    async onEnter() {
        await this._loadBiome();
        await this._createCharacter();
        await this._createPets();
        await this._createProps();
    }

    public onExit() {
    }

    private async _createCharacter() {
        this.characterNode = await loadAndInstantiatePrefab('character/Character');
        const character = this.characterNode.getComponent(Character);

        await character.init();

        this.characterNode.setPosition(new Vec3(7, 2, 7));
        this._scene.addChild(this.characterNode);

        this.gameManager.cameraNode.getComponent(orbit).focusEntity = this.characterNode;
    }

    private async _loadBiome() {
        const blockRarity = await loadJson<BiomesConfig>('biomes/blockRarity');

        for (const biome of playerProgress.progress.biomes) {
            const biomeNode = await loadAndInstantiatePrefab(`biomes/${biome}`);

            const chunkManager: Chunk = biomeNode.getComponent(Chunk);
            chunkManager.biomeData = blockRarity[biome];
            chunkManager.init();

            biomeNode.setPosition(chunkManager.biomePos.x, chunkManager.biomePos.y, chunkManager.biomePos.z);
            this._scene.addChild(biomeNode);


            //blockProvider.setActiveChunk(chunkManager);
        }
    }

    private async _createPets() {

        const petMangerNode = await loadAndInstantiatePrefab(`pets/PetManager`);
        const petManger = petMangerNode.getComponent(PetManager);

        petManger.target = this.characterNode;

        await petManger.init();

        const forward = this.characterNode.forward.clone();
        const backward = forward.multiplyScalar(1);

        const petOffset = backward.multiplyScalar(1.5);
        const petPosition = this.characterNode.getPosition().clone().add(petOffset);

        petMangerNode.setPosition(petPosition);
        this._scene.addChild(petMangerNode);
    }

    private async _createProps() {
        const dynamitePrefab = await loadPrefab(`props/Dynamite`);

        inventoryManager.addItem(new DynamiteItem(dynamitePrefab));
    }
}




























