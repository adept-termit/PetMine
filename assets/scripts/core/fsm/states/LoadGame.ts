import {director, Node, Scene, Vec3} from "cc";

import {IState} from "db://assets/scripts/core/fsm/IState";
import {GameManager} from "db://assets/scripts/core/fsm/GameManager";
import {loadAndInstantiatePrefab, loadJson} from "db://assets/scripts/core/utils/ResourcesLoader";
import {Character} from "db://assets/scripts/character/Character";
import {orbit} from "db://assets/scripts/camera/orbit";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";
import {BiomeManager} from "db://assets/scripts/biomes/BiomeManager";
import {PetManager} from "db://assets/scripts/pets/PetManager";
import {Skin} from "db://assets/scripts/biomes/WorldData";
import {PetStateMachine} from "db://assets/scripts/pets/PetStateMachine";

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
        for (const biome of playerProgress.progress.biomes) {
            const biomeNode = await loadAndInstantiatePrefab(`biomes/${biome}`);
            const manager = biomeNode.getComponent(BiomeManager);

            await manager.init(biomeNode.name);

            biomeNode.setPosition(manager.pos)
            this._scene.addChild(biomeNode);
        }
    }

    private async _createPets() {

        const petMangerNode = await loadAndInstantiatePrefab(`pets/PetManager`);
        const petManger = petMangerNode.getComponent(PetManager);
        const petStateMachine = petMangerNode.getComponent(PetStateMachine);

        petManger.target = this.characterNode;
        petStateMachine.setTarget(this.characterNode);

        await petManger.init();

        this._scene.addChild(petMangerNode);
    }
}




























