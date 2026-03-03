import { ROUNDING } from "@/lib/utils"
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
    return `(${vector.x.toFixed(ROUNDING)}; ${vector.y.toFixed(ROUNDING)}; ${vector.z.toFixed(ROUNDING)})`
}

export function distance_vector3D(first: Coords3D, second: Coords3D) : Coords3D{
    return {
        x: math.abs(second.x - first.x),
        y: math.abs(second.y - first.y),
        z: math.abs(second.z - first.z),
    }
}

export function distance_vector2D(first: Coordinates, second: Coordinates) : Coordinates{
    return {
        x: math.abs(second.x - first.x),
        y: math.abs(second.y - first.y),
    }
}