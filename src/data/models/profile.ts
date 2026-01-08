import { Landmark } from "@/data/models/landmark"
import Color from "color"
import { distance_vector, type Coords3D } from "./coordinates"
import { Deque } from "./structures"

export class Profile {
    label: string
    landmarks: Ends
    sub_landmarks: Coords3D[]
    nbr_steps: number
    color: Color
    edit_label: boolean
    edit_profile: boolean
    show: boolean

    constructor(label: string, landmarks: Ends | null = null, sub_landmarks: Coords3D[] | null = null, nbr_steps: number | null = null, color: Color | null = null) {
        this.label = label
        this.landmarks = landmarks || new Ends
        this.sub_landmarks = sub_landmarks || []
        this.nbr_steps = nbr_steps || 0
        this.edit_label = false
        this.edit_profile = false
        this.show = true
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
    }

    get distance(): Coords3D[] | undefined {
        if (!this.landmarks.isFull()) {
            return undefined
        }
        let intervals: Coords3D[] = []
        let current : Coords3D = this.landmarks.first!.pose!
        this.sub_landmarks.forEach((pose) => {
            intervals.push(distance_vector(current, pose))
            current = pose
        })
        intervals.push(distance_vector(current, this.landmarks.last!.pose!))
        return intervals
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
        return { label: this.label, nbr_steps: this.nbr_steps, color: this.color.hex(), landmarks: this.landmarks.toJSON() }
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
    start : Coords3D,
    subLandmarks : Coords3D[],
    end : Coords3D,
}