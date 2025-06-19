import { renderer, Camera, Vec3, geometry, Color, director, find, GeometryRenderer } from "cc";
import { EDITOR } from "cc/env";

let geometryRenderer: GeometryRenderer;

function getGeometryRender(): GeometryRenderer | null | undefined {
    if (geometryRenderer) {
        return geometryRenderer;
    }

    let camera: renderer.scene.Camera | undefined = undefined;

    if (EDITOR) {
        camera = globalThis.cce?.Camera.camera.camera as renderer.scene.Camera;
    } else {
        camera = find('Main Camera')?.getComponent(Camera)?.camera;
    }

    if (!camera) {
        return;
    }

    if (camera) {
        camera.initGeometryRenderer();
    }
    
    return camera && camera.geometryRenderer || director.root?.pipeline.geometryRenderer;
}

export function drawCapsule(position: Vec3, center: Vec3, radius:number, height:number, color = Color.GREEN) {
    const geometryRenderer = getGeometryRender();

    if (!geometryRenderer) return;

    geometryRenderer.addCapsule(Vec3.add(new Vec3(), position, center), radius, height, color, 10, 4, true);
}

export function drawSphere(center: Vec3, radius:number, color = Color.GREEN) {
    const geometryRenderer = getGeometryRender();

    if (!geometryRenderer) return;
    geometryRenderer.addSphere(center, radius, color, 10, 4, true);
}

export function drawCube(position: Vec3, extent: Vec3 | number, color = Color.WHITE) {
    const geometryRenderer = getGeometryRender();

    if (!geometryRenderer)  {
        return geometryRenderer;
    }

    if (typeof extent === 'number') {
        extent = new Vec3(extent, extent, extent);
    }

    geometryRenderer.addBoundingBox(geometry.AABB.fromPoints(
        new geometry.AABB(),
        Vec3.scaleAndAdd(new Vec3(), position, extent, -0.5),
        Vec3.scaleAndAdd(new Vec3(), position, extent, 0.5),
    ), color, true);
}

export function drawLineOriginDirLen(from: Vec3, dir: Vec3, length: number, color = Color.WHITE) {
    const geometryRenderer = getGeometryRender();

    if (!geometryRenderer)  {
        return geometryRenderer;
    }

    geometryRenderer.addLine(
        from,
        Vec3.scaleAndAdd(new Vec3(), from, dir, length),
        color,
    );
}

export function drawLineFromTo(from: Vec3, to: Vec3, color = Color.WHITE) {
    const geometryRenderer = getGeometryRender();

    if (!geometryRenderer)  {
        return geometryRenderer;
    }

    geometryRenderer.addLine(
        from,
        to,
        color,
    );
}