import {IState} from "db://assets/scripts/core/fsm/IState";
import { GameManager} from "db://assets/scripts/core/fsm/GameManager";
import {director, Scene} from "cc";
import {loadAndInstantiatePrefab} from "db://assets/scripts/core/utils/ResourcesLoader";
import {Character} from "db://assets/scripts/character/Character";
import {orbit} from "db://assets/scripts/camera/orbit";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";
import {BiomeManager} from "db://assets/scripts/biomes/BiomeManager";

export class LoadGame implements IState {
    private gameManager: GameManager;
    private _scene: Scene;

    constructor(game: GameManager) {
        this.gameManager = game;
        this._scene = director.getScene();
    }

    async onEnter() {
        await this._loadBiome();
        await this._createCharacter();
    }

    public onExit() {
    }

    private async _createCharacter() {
        const characterNode = await loadAndInstantiatePrefab('character/Character');
        const character = characterNode.getComponent(Character);

        await character.init();

        this._scene.addChild(characterNode);

        this.gameManager.cameraNode.getComponent(orbit).focusEntity = characterNode;

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
}