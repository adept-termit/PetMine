import {_decorator, Component, Mesh, Node, SkinnedMeshRenderer, Texture2D} from 'cc';

import {loadMesh, loadTexture2D} from "db://assets/scripts/core/utils/ResourcesLoader";

const {ccclass, property} = _decorator;

@ccclass('View')
export class View extends Component {
    @property(SkinnedMeshRenderer) bodyMeshRenderer: SkinnedMeshRenderer;

    private _currentSkin: string;

    get currentSkinId() {
        return this._currentSkin;
    }

    async changeSkin(skinName: string) {
        if (this._currentSkin === skinName) return;

        this._currentSkin = skinName;

        try {
            const [mesh, texture] = await Promise.all([
                this._loadSkinMesh(skinName),
                this._loadSkinTexture(skinName)]
            );

            this.bodyMeshRenderer.mesh = mesh;
            this.bodyMeshRenderer.material.setProperty('albedoMap', texture);
        } catch (e) {
            console.error(e);
        }
    }

    private async _loadSkinMesh(skinName: string) {
        const path = `character/meshes/${skinName}/Body`;

        return await loadMesh(path);
    }

    private async _loadSkinTexture(skinName: string) {
        const path = `character/textures/${skinName}/texture`;

        return await loadTexture2D(path);
    }

    async loadAxe(pickaxe: string) {
        
    }
}
