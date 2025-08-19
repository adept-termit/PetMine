import { _decorator, Component, Node, Vec3, Color, Graphics, MeshRenderer, Mesh, Material, PrimitiveMesh, physics, PhysicsSystem, geometry } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DebugSweep')
export class DebugSweep extends Component {
    @property
    checkDistance: number = 10;

    @property
    sphereRadius: number = 2;

    private tmpRay = new geometry.Ray();
    private debugGraphics: Graphics | null = null;
    private debugSphere: Node | null = null;

    onLoad() {
        // Добавляем Graphics для рисования линии
        this.debugGraphics = this.node.addComponent(Graphics);

        // Создаем сферу для визуализации sweepSphere
        this.debugSphere = new Node("DebugSphere");
        const sphereMesh = this.debugSphere.addComponent(MeshRenderer);
        sphereMesh.mesh = PrimitiveMesh.createSphere(this.sphereRadius, 16, 16);
        sphereMesh.material = new Material(); // Можно настроить цвет/прозрачность
        this.node.parent.addChild(this.debugSphere);
    }

    private checkAhead() {
        const pos = this.node.worldPosition.clone();

        // Направление вперёд
        const forward = this.node.forward.clone();
        const start = pos.clone();
        const end = pos.clone().add(forward.multiplyScalar(this.checkDistance));

        // Создаем луч
        geometry.Ray.fromPoints(this.tmpRay, start, end);

        // Рисуем луч
        this.drawDebugRay(start, end);

        // Рисуем сферу на конце
        if (this.debugSphere) {
            this.debugSphere.setWorldPosition(end);
        }

        const result = PhysicsSystem.instance.sweepSphereClosest(
            this.tmpRay,
            this.sphereRadius,
            PhysicsSystem.PhysicsGroup.TRIGGER_ZONE,
            this.checkDistance,
            true,
        );

        if (result) {
            const sweepResult = PhysicsSystem.instance.sweepCastClosestResult;
            console.log(`Попадание в: ${sweepResult.collider.node.name}`);
        }
    }

    private drawDebugRay(start: Vec3, end: Vec3) {
        if (!this.debugGraphics) return;

        this.debugGraphics.clear();
        this.debugGraphics.strokeColor = Color.RED;

        // На 3D сцене Graphics работает в 2D координатах экрана, поэтому для 3D лучше использовать Mesh линии
        // Но для быстрого визуального дебага можно использовать позицию в XZ плоскости:
        this.debugGraphics.moveTo(start.x, start.z);
        this.debugGraphics.lineTo(end.x, end.z);
        this.debugGraphics.stroke();
    }

    update(dt: number) {
        this.checkAhead();
    }
}