import { Landmark } from "@/data/models/landmark"
import Color from "color"
import { distance_vector2D, distance_vector3D, type Coordinates, type Coords3D } from "./coordinates"
import { Deque } from "./structures"
import type { ProfileObject } from "@/lib/stores"

export class Profile {
    label: string
    landmarks: Ends
    subLandmarkSegments: Coordinates[][]
    edgeThreshold: string
    color: Color
    hover_profile: number | undefined
    hover_segment: number | undefined
    smooth : boolean
    edit_label: boolean
    edit_profile: boolean
    show: boolean

    constructor(label: string, landmarks: Ends | null = null, subLandmarkSegments: Coordinates[][] | null = null, edgeThreshold: string | undefined = undefined, smooth : boolean = true, color: Color | null = null) {
        this.label = label
        this.landmarks = landmarks || new Ends
        this.subLandmarkSegments = subLandmarkSegments || []
        this.edgeThreshold = edgeThreshold || "none"
        this.smooth = smooth
        this.edit_label = false
        this.edit_profile = false
        this.hover_profile = undefined
        this.hover_segment = undefined
        this.show = true
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
    }

    get graph(): Coordinates[][] {
        if (this.subLandmarkSegments.length === 0) {
            return []
        }

        const origin = this.subLandmarkSegments[0]![0]!

        let graph = this.subLandmarkSegments.map((segment) => {

            return segment.map((point) => {
                const dx = point.x - origin.x
                const dy = point.y - origin.y

                return {
                    x: dx,
                    y: dy,
                }
            })

        })
        return graph // list of segments
    }

    get length(): Coordinates[][] | undefined {
        if (!this.landmarks.isFull() || this.subLandmarkSegments.length === 0) {
            return undefined
        }
        let intervals: Coordinates[][] = []

        let last: Coordinates | null = null

        this.subLandmarkSegments.forEach((segment) => {
            let interval : Coordinates[] = []
            segment.forEach((point) => {
                if (last == null) {
                    last = point
                    return
                }
                interval.push(distance_vector2D(last, point))
                last = point
            })
            intervals.push(interval)
        })

        return intervals
    }

    get distance(): Coords3D[] | undefined {
        if (!this.landmarks.isFull()) {
            return undefined
        }


        let start = this.landmarks.first!.pose
        let end = this.landmarks.last!.pose
        return [distance_vector3D(start, end)]
    }

    reset(): void {
        this.landmarks = new Ends()
    }

    popFirst() {
        this.landmarks.popFirst()
    }

    popLast() {
        this.landmarks.popLast()
    }

    addLandmark(landmark: Landmark) {
        this.landmarks.add(landmark)
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
        this.color = Color.rgb(color[0]!, color[1]!, color[2]!)
    }

    toJSON() {
        return { label: this.label, color: this.color.hex(), landmarks: this.landmarks.toJSON(), subLandmarkSegments: this.subLandmarkSegments, edgeThreshold: this.edgeThreshold, smooth: this.smooth }
    }

    static fromJSON(json: ProfileObject): Profile {
        let landmarks = Ends.fromJSON(json.landmarks)
        return new Profile(json.label, landmarks, json.subLandmarkSegments, json.edgeThreshold, json.smooth, Color(json.color))
    }
}

export class Ends extends Deque<Landmark> {

    static fromJSON(json: EndsObject) {
        let landmarks = json.array.map((x: Landmark) => new Landmark(x.id, x.label, x.pos, x.pose, Color(x.color)))
        return new Ends((landmarks.length > 0) ? landmarks[0] : null, (landmarks.length >= 2) ? landmarks[1] : null)
    }

    constructor(first: Landmark | null = null, second: Landmark | null = null) {
        super(2)
        if (first) {
            this.add(first)
        }
        if (second) {
            this.add(second)
        }
    }

    get second(): Landmark | null {
        return (this.isFull()) ? this.last! : null;
    }

    remove(landmark: Landmark) {
        if (this.isEmpty()) {
            return
        }
        if (landmark.equals(this.second)) {
            this.popLast()
        }
        if (landmark.equals(this.first)) {
            this.popFirst()
        }
    }

    setColorHEX(color: string) {
        if (this.isEmpty()) return
        this.forEach((landmark) => landmark.setColorHEX(color))
    }
}

export type EndsObject = {
    array: Array<Landmark>,
    maxLength: number
}

export type ProfileLandmarks = {
    start: Coords3D,
    subLandmarkSegments: Coords3D[][],
    end: Coords3D,
}