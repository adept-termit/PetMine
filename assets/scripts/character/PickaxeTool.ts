import {
    _decorator,
    Camera,
    Component,
    EventMouse,
    EventTouch,
    geometry, Node,
    PhysicsSystem,
    Vec3,
    Vec2, Color
} from 'cc';

import {eventService} from "db://assets/scripts/core/utils/EventService";
import {gameManager} from "db://assets/scripts/core/fsm/GameManager";
import {worldData} from "db://assets/scripts/biomes/WorldData";
import {BlockInfo} from "db://assets/scripts/biomes/BlockInfo";
import {Generate} from "db://assets/scripts/biomes/Generate";
import {drawLineOriginDirLen} from "db://assets/scripts/core/utils/DebugDraw";
import {gameInput} from "db://assets/scripts/core/Input/GameInput";
import {TakeDamageController} from "db://assets/scripts/biomes/block/TakeDamageController";
import {Block} from "db://assets/scripts/biomes/block/Block";

const {ccclass, property} = _decorator;

@ccclass('PickaxeTool')
export class PickaxeTool extends Component {
    @property({type: PhysicsSystem.PhysicsGroup}) interactionGroup = PhysicsSystem.PhysicsGroup.DEFAULT;

    private ray: geometry.Ray = new geometry.Ray();

    /**
     * Удар по экрану для взаимодействия с блоком
     */
    public swingAtScreenPosition(vector: Vec2): Node | null {
        const location = vector;

        // Преобразуем координаты экрана в луч (Ray)
        const camera = gameManager.cameraNode.getComponent(Camera);
        camera.screenPointToRay(location.x, location.y, this.ray);

        if (!PhysicsSystem.instance.raycastClosest(this.ray, this.interactionGroup)) {
            return null;
        }

        const result = PhysicsSystem.instance.raycastClosestResult;

        // Проверка, находится ли цель в пределах досягаемости
        if (!this.isWithinReach(this.node.getWorldPosition(), result.collider.node.getWorldPosition())) return null;

        console.log(result.collider.node.getWorldPosition())

        return result.collider.node;
    }

    /**
     * Наносит урон текущему блоку
     */
    public applyDamageToCurrentBlock(blockNode: Node, damageAmount: number): void {
        const block = blockNode.getComponent(Block);

        if (!block) return;

        block.takeDamage(damageAmount);
    }

    /**
     * Проверка, находится ли точка попадания в пределах досягаемости игрока (±2 блока)
     */
    private isWithinReach(target: Vec3, reference: Vec3): boolean {
        const t = new Vec3(
            Math.round(target.x),
            Math.round(target.y),
            Math.round(target.z)
        );
        const r = new Vec3(
            Math.round(reference.x),
            Math.round(reference.y),
            Math.round(reference.z)
        );

        return (
            t.x >= r.x - 2 && t.x <= r.x + 2 &&
            t.y >= r.y - 2 && t.y <= r.y + 2 &&
            t.z >= r.z - 2 && t.z <= r.z + 2
        );
    }

}
