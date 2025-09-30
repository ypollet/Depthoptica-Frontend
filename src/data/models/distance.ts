import { Landmark } from "@/data/models/landmark"
import Color from "color"
import * as math from "mathjs"
import type { Positions } from "./coordinates"

export class Distance {
    label: string
    landmarks: Array<Landmark>
    color: Color
    edit_label: boolean
    edit_distance: boolean
    show: boolean

    constructor(label: string, landmarks: Array<Landmark> | null = null, color: Color | null = null) {
        this.label = label
        this.landmarks = landmarks || new Array()
        this.edit_label = false
        this.edit_distance = false
        this.show = true
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
    }

    get distance(): Positions[] | undefined {
        if (this.landmarks.length < 2) {
            return undefined
        }
        let distance: Positions[] = new Array()
        for (let i = 1; i < this.landmarks.length; i++) {
            distance.push({
                depth: {
                    x: math.abs(this.landmarks[i].positions.depth.x - this.landmarks[i - 1].positions.depth.x),
                    y: math.abs(this.landmarks[i].positions.depth.y - this.landmarks[i - 1].positions.depth.y),
                    z: math.abs(this.landmarks[i].positions.depth.z - this.landmarks[i - 1].positions.depth.z)
                },
                layer: {
                    x: math.abs(this.landmarks[i].positions.layer.x - this.landmarks[i - 1].positions.layer.x),
                    y: math.abs(this.landmarks[i].positions.layer.y - this.landmarks[i - 1].positions.layer.y),
                    z: math.abs(this.landmarks[i].positions.layer.z - this.landmarks[i - 1].positions.layer.z)
                }
            })
        }
        return distance
    }

    in(landmark: Landmark | string): boolean {
        return this.landmarks.some(e => e.equals(landmark))
    }

    reset(): void {
        this.landmarks = new Array<Landmark>()
    }

    remove(landmark: Landmark | string) {
        this.landmarks = this.landmarks.filter(e => !e.equals(landmark))
    }

    getColorHEX(): string {
        return this.color.hex()
    }
    setColorHEX(color: string) {
        this.color = Color(color)
    }
    setColorRGB(color: number[]) {
        if (color.length < 3) {
            return
        }
        this.color = Color.rgb(color[0], color[1], color[2])
    }

    toJSON() {
        return { label: this.label, color: this.color.hex(), landmarks: this.landmarks.map((x) => x.toJSON()) }
    }
}