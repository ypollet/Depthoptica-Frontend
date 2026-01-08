import * as math from "mathjs"

export type Coordinates = {
    x: number,
    y: number
}

export type DistanceVectors = {
    depth: Vector3D,
    layer: Vector3D
}

export type Coords3D = {
    x: number,
    y: number,
    z: number
}

export type Vector3D = Coords3D



export function vectorToString(vector: Vector3D) {
    return `(${vector.x.toFixed(2)}; ${vector.y.toFixed(2)}; ${vector.z.toFixed(2)})`
}

export function distance_vector(first: Coords3D, second: Coords3D) : Coords3D{
    return {
        x: math.abs(second.x - first.x),
        y: math.abs(second.y - first.y),
        z: math.abs(second.z - first.z),
    }
}

/*
export function scaleDepthInt(pose: Pose, intrinsics: Intrinsics, depthMin: number, depthMax: number) {
    let z = ((depthMax - depthMin) / 256 * pose.depth) + depthMin
    return {
        x: (pose.x - intrinsics.cx) / intrinsics.fx * pose.depth,
        y: (pose.y - intrinsics.cy) / intrinsics.fy * pose.depth,
        z: z,
    }
}

export function scaleDepthRatio(pose: Pose, pixelRatio: Ratio, depthMin: number, depthMax: number) {
    return {
        x: pose.x * pixelRatio.width,
        y: pose.y * pixelRatio.height,
        z: ((depthMax - depthMin) / 256 * pose.depth) + depthMin,
    }
}

export function scaleLayer(pose: Pose, pixelRatio: Ratio, step: number) {
    return {
        x: pose.x * pixelRatio.width,
        y: pose.y * pixelRatio.height,
        z: pose.layer * step,
    }
}
*/
