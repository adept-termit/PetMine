import {
    _decorator,
    Camera,
    Component,
    EventMouse,
    EventTouch,
    geometry, Node,
    PhysicsSystem,
    Vec3
} from 'cc';

import {eventService} from "db://assets/scripts/core/utils/EventService";
import {gameManager} from "db://assets/scripts/core/fsm/GameManager";
import {worldData} from "db://assets/scripts/biomes/WorldData";
import {BlockInfo} from "db://assets/scripts/biomes/BlockInfo";
import {Generate} from "db://assets/scripts/biomes/Generate";

const {ccclass, property} = _decorator;

@ccclass('Hit')
export class Hit extends Component {
    private ray: geometry.Ray = new geometry.Ray();
    private inverseTransformPoint: Vec3 = new Vec3();
    private readonly offset: number = 0.02; // Смещение для коррекции точек попадания
    private readonly customOffset = new Vec3(0.5, 0.5, 0.5);

    private damage: number = 50;

    onEnable() {
        // Подписка на событие мыши
        eventService.eventEmitter.on('MOUSE_DOWN', this._onInput, this);
    }

    onDisable() {
        // Отписка от события
        eventService.eventEmitter.off('MOUSE_DOWN', this._onInput, this);
    }

    private _onInput(event: EventMouse | EventTouch) {
        const location = event.getLocation();

        // Преобразуем координаты экрана в луч (Ray)
        const camera = gameManager.cameraNode.getComponent(Camera);
        camera.screenPointToRay(location.x, location.y, this.ray);

        // Проверка попадания по блоку CHUNK_BLOCK
        if (PhysicsSystem.instance.raycastClosest(this.ray,PhysicsSystem.PhysicsGroup.CHUNK_BLOCK)) {
            if (!worldData.currentBiome) return;

            // Получаем координаты блока, по которому попали
            const blockHitPosition = this.getHitBlockPosition();
            const correctedCharacterPosition = this.getCharacterWorldPositionInChunkSpace();

            // Проверка, находится ли цель в пределах досягаемости
            if (this.isWithinRange(blockHitPosition, correctedCharacterPosition)) {

                const chunkData = worldData.chunkBiomeDictionary.get(worldData.currentBiome)

                blockHitPosition.add(this.customOffset)

                const block = chunkData.blocksInChunkByPos[blockHitPosition.y]?.[blockHitPosition.x]?.[blockHitPosition.z];

                if (!block) {
                    //Проверка, есть ли еще блоки в чанке
                    if (this.isChunkEmpty(chunkData.blocksInChunkByPos)) {
                        // Чанк пуст, создаем новый
                        console.log(111)
                        return;
                    }
                    return;
                }

                const blockInfo: BlockInfo = block.getComponent(BlockInfo);

                if (!blockInfo.alreadyHit) {
                    eventService.eventEmitter.emit('SPAWN_BLOCKS_AROUND_BLOCK', chunkData, block);
                    blockInfo.alreadyHit = true;
                }

                blockInfo.hp -= this.damage;
                blockInfo.animation();

                if (blockInfo.hp <= 0) {
                    eventService.eventEmitter.emit('DROP_BLOCK', chunkData, block);
                }

                if (this.isChunkEmpty(chunkData.blocksInChunkByPos)) {
                    // Чанк пуст, создаем новый
                    console.log(111)
                    return;
                }

                console.log(chunkData.blocksInChunkByPos[blockHitPosition.y]?.[blockHitPosition.x]?.[blockHitPosition.z]);
            }
        }
    }

    /**
     * Получает координаты блока, на котором находиться персонаж
     */
    private getCharacterWorldPositionInChunkSpace(): Vec3 {
        const result = PhysicsSystem.instance.raycastClosestResult;
        const chunkNode = worldData.chunkBiomeDictionary.get(worldData.currentBiome).chunkNode;

        const characterWorldPositionInChunkSpace = chunkNode.inverseTransformPoint(new Vec3(), this.node.getWorldPosition());

        return new Vec3(
            Math.floor(characterWorldPositionInChunkSpace.x - (result.hitNormal.x > 0 ? this.offset : -this.offset)),
            Math.floor(characterWorldPositionInChunkSpace.y - (result.hitNormal.y > 0 ? this.offset : -this.offset)) - 1,
            Math.floor(characterWorldPositionInChunkSpace.z - (result.hitNormal.z > 0 ? this.offset : -this.offset))
        );
    }

    /**
     * Получает координаты блока, по которому пришёлся луч
     */
    private getHitBlockPosition(): Vec3 {
        const result = PhysicsSystem.instance.raycastClosestResult;
        const chunkNode = worldData.chunkBiomeDictionary.get(worldData.currentBiome).chunkNode;

        const localHitPoint = chunkNode.inverseTransformPoint(this.inverseTransformPoint, result.hitPoint);

        return new Vec3(
            Math.floor(localHitPoint.x - (result.hitNormal.x > 0 ? this.offset : -this.offset)),
            Math.floor(localHitPoint.y - (result.hitNormal.y > 0 ? this.offset : -this.offset)),
            Math.floor(localHitPoint.z - (result.hitNormal.z > 0 ? this.offset : -this.offset))
        );
    }

    /**
     * Проверка, находится ли точка попадания в пределах досягаемости игрока (±2 блока)
     */
    private isWithinRange(target: Vec3, reference: Vec3): boolean {
        return (
            target.x >= reference.x - 2 && target.x <= reference.x + 2 &&
            target.y >= reference.y - 2 && target.y <= reference.y + 2 &&
            target.z >= reference.z - 2 && target.z <= reference.z + 2
        );
    }

    /**
     * Проверяет, пуст ли чанк (нет ли в нём ни одного блока).
     * Структура: blocksInChunkByPos[y][x][z] = entity
     *
     * @param blocksInChunkByPos - Вложенный объект с блоками по координатам y, x, z
     * @returns true, если чанк пуст, иначе false
     */
    private isChunkEmpty(blocksInChunkByPos: any): boolean {
        // Проходим по всем Y-уровням в чанке
        for (const y in blocksInChunkByPos) {
            const xRow = blocksInChunkByPos[y];
            if (!xRow) continue; // Пропускаем, если на этом уровне ничего нет

            // Проходим по всем X-уровням на данном Y
            for (const x in xRow) {
                const zRow = xRow[x];
                if (!zRow) continue; // Пропускаем, если на этом уровне тоже ничего нет

                // Проходим по всем Z-уровням на данном X и Y
                for (const z in zRow) {
                    // Если найден непустой блок — чанк не пуст
                    if (zRow[z]) {
                        return false;
                    }
                }
            }
        }

        // Если ни одного блока не найдено — чанк пуст
        return true;
    }

    start() {
    }

    update(deltaTime: number) {
    }
}
