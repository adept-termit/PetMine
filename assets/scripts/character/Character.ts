import {_decorator, Component, EventMouse, EventTouch, Input, input, Node, Vec2, Vec3,Quat,Mat4} from 'cc';
import {View} from "db://assets/scripts/character/View";
import {gameManager} from "db://assets/scripts/core/fsm/GameManager";
import {Move} from "db://assets/scripts/character/Move";
import {playerProgress} from "db://assets/scripts/core/storage/PlayerProgress";
import {Animator} from "db://assets/scripts/character/Animator";
import {
    AnimationGraphPreviewBase
} from "@cocos/creator-types/editor/packages/scene/@types/cce/3d/manager/animation-graph-preview/base";
import {PickaxeTool} from "db://assets/scripts/character/PickaxeTool";
import {eventService} from "db://assets/scripts/core/utils/EventService";
import {gameInput} from "db://assets/scripts/core/Input/GameInput";
import {BlockInfo} from "db://assets/scripts/biomes/BlockInfo";
import {BiomeBlockMap, Skin, SkinMap, worldData} from "db://assets/scripts/biomes/WorldData";
import {loadJson} from "db://assets/scripts/core/utils/ResourcesLoader";

const {ccclass, property} = _decorator;

@ccclass('Character')
export class Character extends Component {
    @property(Node) bodyNode: Node;
    @property(View) view: View;
    @property(Move) move: Move;
    @property(Animator) animator: Animator;
    @property(PickaxeTool) pickaxeTool: PickaxeTool;

    private _cameraNode: Node;
    private pickaxeStatsMap: SkinMap = {};
    private currentPickaxeDamage: number;
    private targetBlockForHit: Node | undefined = undefined; // Буфер для хранения цели, которая будет обработана в onPickaxeHit
    private miningTimer = 0; // таймер накопления времени между ударами
    private miningInterval = 0.6; // интервал между ударами при удержании ЛКМ
    private isMining = false; // флаг, активна ли фаза копки
    private hasAppliedDamageThisSwing = false; // контроль: удар уже нанесён за текущую анимацию
    private isMouseHeld = false; // флаг удержания ЛКМ

    /**
     * Инициализация персонажа.
     */
    async init() {

        this._cameraNode = gameManager.cameraNode; // Привязываем камеру

        const selectedPickaxeId = playerProgress.progress.selected.pickaxe || 'default';

        await this.view.changeSkin(playerProgress.progress.selected.skin || 'boy');// Устанавливаем скин игрока
        await this.view.loadAxe(selectedPickaxeId);// Загружаем модель кирки
        await this.loadPickaxeStats(selectedPickaxeId);//Загружает данные о кирках и устанавливает урон активной кирки

        this.move.setCamera(this._cameraNode) // Устанавливаем камеру для передвижения персонажа
    }

    /**
     * Загружает данные о кирках и устанавливает урон активной кирки.
     */
    private async loadPickaxeStats(pickaxeId: string) {

        const pickaxeData = await loadJson<{ skins: Skin[] }>('pickaxes/pickaxeData');// Загружаем данные о кирках из JSON
        const pickaxeList = pickaxeData.skins;

        // Преобразуем массив в объект для быстрого доступа по ID
        for (const skin of pickaxeList) {
            this.pickaxeStatsMap[skin.id] = skin;
        }

        this.currentPickaxeDamage = this.pickaxeStatsMap[pickaxeId]?.damage ?? 0;
    }


    start() {
    }

    startMining() {
        this.isMining = true;
        this.miningTimer = this.miningInterval; // первый удар сразу
    }

    stopMining() {
        this.isMining = false;
    }

    onPickaxeHit() {
        if (!this.targetBlockForHit || this.hasAppliedDamageThisSwing) {
            return;
        }

        // Наносим урон текущему блоку
        this.pickaxeTool.applyDamageToCurrentBlock(this.targetBlockForHit, this.currentPickaxeDamage);

        this.hasAppliedDamageThisSwing = true;

        this.targetBlockForHit = undefined;
    }

    update(deltaTime: number) {
        const isMousePressed = gameInput.isLeftMousePressed;

        // 1. Обнаружение начала нажатия (клик или начало удержания)
        if (isMousePressed && !this.isMouseHeld) {
            this.isMouseHeld = true;
            this.startMining(); // запускаем процесс копки
        }

        // 2. Обнаружение отпускания кнопки мыши
        if (!isMousePressed && this.isMouseHeld) {
            this.isMouseHeld = false;
            this.stopMining(); // останавливаем копку
        }

        // 3. Если удерживаем кнопку — обновляем таймер и копаем
        if (this.isMining) {
            this.miningTimer += deltaTime;

            if (this.miningTimer >= this.miningInterval) {
                this.miningTimer = 0;

                // Получаем цель, но ТОЛЬКО если у нас нет текущей
                if (!this.targetBlockForHit) {
                    const target = this.pickaxeTool.swingAtScreenPosition(gameInput.mouseMoveVector);
                    this.targetBlockForHit = target;


                    if (target) {
                        const dir = target.worldPosition.clone().subtract(this.node.worldPosition);
                        dir.y = 0;

                        if (!dir.equals(Vec3.ZERO)) {
                            dir.normalize();

                            // angleY = угол между осью -Z (лицо персонажа) и направлением к цели
                            const angleY = Math.atan2(dir.x, dir.z); // !! Z и X местами!
                            const rotation = new Quat();
                            Quat.fromEuler(rotation, 0, angleY * 180 / Math.PI, 0); // знак зависит от ориентации модели

                            this.bodyNode.setWorldRotation(rotation);
                        }
                    }
                }

                this.hasAppliedDamageThisSwing = false;

                this.animator.setMine(true); // одна анимация удара
            }
        }
    }
}

