import {Node} from 'cc';
import {worldData} from 'db://assets/scripts/biomes/WorldData';
import {PetController} from 'db://assets/scripts/pets/PetController';
import {PetService} from 'db://assets/scripts/pets/PetService';

export class PetMinerSystem {
    constructor(private petsRoot: Node) {
    }

    update(dt: number) {

        const chunkData = worldData.chunkBiomeDictionary.get(worldData.currentBiome);

        this.petsRoot.children.forEach(petNode => {
            const petController = petNode.getComponent(PetController);
            if (!petController || petController.target) return;

            const blocks = chunkData.blocksInChunkByPos;
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
                        const key = `${x}:${y}:${z}`;

                        if (!block) {
                            PetService.targetedBlocks.delete(key);
                            continue;
                        }

                        if (PetService.targetedBlocks.has(key)) continue;

                        PetService.targetedBlocks.add(key);

                        petController.target = block;
                        return;
                    }
                }
            }
        });
    }
}
