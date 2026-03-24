import type { Updater } from "@tanstack/vue-table"
import type { ClassValue } from "clsx"
import type { Ref } from "vue"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import * as math from 'mathjs';
import type { Coordinates } from '@/data/models/coordinates';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function valueUpdater<T extends Updater<any>>(updaterOrValue: T, ref: Ref) {
  ref.value
    = typeof updaterOrValue === "function"
      ? updaterOrValue(ref.value)
      : updaterOrValue
}

export function degreesToRad(deg: number) {
  return (deg * math.pi) / 180.0;
}

export function radToDegrees(rad: number) {
  return (rad * 180.0) / math.pi;
}

export enum Scale {
    m = 1000,
    dm = 100,
    cm = 10,
    mm = 1,
    µm = 0.001,
    nm = 0.000001,
}

export const ROUNDING = 2


export const ZOOM_MIN = 0.05
export const ZOOM_MAX = 4
export const DOT_RADIUS = 4.5
export const SPACE_TARGET = 0.2

export function computeDistance(intervals: Coordinates[]): number {
    let dist = 0
    intervals.forEach((interval: Coordinates) => {
        let squared = math.map(Object.values(interval), math.square)
        let sum = math.sum(squared)
        // can't be a Complex number
        dist += math.sqrt(sum) as number
    })
    return dist
}

