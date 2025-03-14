import {instantiate, Mesh, Node, Prefab, resources, Texture2D} from "cc";

export function loadAndInstantiatePrefab(path: string): Promise<Node> {
    return new Promise<Node>((resolve, reject) => {
        resources.load(path, Prefab, (err, prefab) => {
            if (err) {
                reject(err);
            }

            const instance = instantiate(prefab);

            resolve(instance);
        });
    });
}

export function loadMesh(path: string): Promise<Mesh> {
    return new Promise<Mesh>((resolve, reject) => {
        resources.load(path, Mesh, (err, mesh) => {
            if (err) {
                reject(err);
            }

            resolve(mesh);
        });
    });
}

export function loadTexture2D(path: string): Promise<Texture2D> {
    return new Promise<Texture2D>((resolve, reject) => {
        resources.load(path, Texture2D, (err: Error, texture: Texture2D): void => {
            if (err) {
                reject(err);
            }

            resolve(texture);
        });
    });
}
