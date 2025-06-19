import {_decorator, Component, Mesh, Node, SkinnedMeshRenderer, MeshRenderer, Texture2D} from 'cc';

import {loadMesh, loadTexture2D} from "db://assets/scripts/core/utils/ResourcesLoader";

const {ccclass, property} = _decorator;

@ccclass('View')
export class View extends Component {
    @property(SkinnedMeshRenderer) bodyMeshRenderer: SkinnedMeshRenderer;
    @property(MeshRenderer) pickAxeMeshRenderer: MeshRenderer;

    private _currentSkin: string;
    private _currentPickaxe: string;

    get currentSkinId() {
        return this._currentSkin;
    }

    get currentPickaxe(): string {
        return this._currentPickaxe;
    }

    async changeSkin(skinName: string) {
        if (this._currentSkin === skinName) return;

        this._currentSkin = skinName;

        try {
            const [mesh, texture] = await Promise.all([
                this._loadSkinMesh(skinName, 'character', 'Body'),
                this._loadSkinTexture(skinName, 'character')]
            );

            this.bodyMeshRenderer.mesh = mesh;
            this.bodyMeshRenderer.material.setProperty('albedoMap', texture);
        } catch (e) {
            console.error(e);
        }
    }

    async loadAxe(pickaxeName: string) {
        if (this._currentPickaxe === pickaxeName) return;

        this._currentPickaxe = pickaxeName;

        try {
            const [mesh, texture] = await Promise.all([
                this._loadSkinMesh(pickaxeName, 'pickaxes','Pick'),
                this._loadSkinTexture(pickaxeName, 'pickaxes')]
            );

            this.pickAxeMeshRenderer.mesh = mesh;
            this.pickAxeMeshRenderer.material.setProperty('albedoMap', texture);
        } catch (e) {
            console.error(e);
        }
    }

    private async _loadSkinMesh(skinName: string, dir: string, suff:string) {
        const path = `${dir}/meshes/${skinName}/${suff}`;

        return await loadMesh(path);
    }

    private async _loadSkinTexture(skinName: string, dir: string) {
        const path = `${dir}/textures/${skinName}/texture`;

        return await loadTexture2D(path);
    }

}
