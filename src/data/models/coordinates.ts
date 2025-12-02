import * as math from "mathjs"
import type { Landmark, Pose, VectorPose } from "./landmark"
import type { Ratio } from "./stack_image"

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

export function distance_vector(first: VectorPose, second: VectorPose) : VectorPose{
    return {
        x: math.abs(second.x - first.x),
        y: math.abs(second.y - first.y),
        depth: math.abs(second.depth - first.depth),
        layer: math.abs(second.layer - first.layer)
    }
}

export function scaleDepth(pose: VectorPose, pixelRatio: Ratio, depthMin: number, depthMax: number) {
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

