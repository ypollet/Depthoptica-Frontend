import { Landmark } from "@/data/models/landmark"
import Color from "color"
import { distance_vector, type Coordinates, type Coords3D } from "./coordinates"
import { Deque } from "./structures"

export class Profile {
    label: string
    landmarks: Ends
    sub_landmarks: Coords3D[]
    color: Color
    edit_label: boolean
    edit_profile: boolean
    show: boolean

    constructor(label: string, landmarks: Ends | null = null, sub_landmarks: Coords3D[] | null = null, nbr_steps: number | null = null, color: Color | null = null) {
        this.label = label
        this.landmarks = landmarks || new Ends
        this.sub_landmarks = sub_landmarks || []
        this.edit_label = false
        this.edit_profile = false
        this.show = true
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
    }

    get graph(): Coordinates[] {
        if (this.sub_landmarks.length === 0) {
            return []
        }

        const origin = this.sub_landmarks[0]!
        return this.sub_landmarks.map((point) => {
            const dx = point.x - origin.x
            const dy = point.y - origin.y
            const dz = point.z - origin.z

            return {
                x: Math.sqrt(dx * dx + dy * dy),
                y: dz,
            }
        })
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
        return { label: this.label, color: this.color.hex(), landmarks: this.landmarks.toJSON(), sub_landmarks: this.sub_landmarks }
    }

    static fromJSON(json: any): Profile {
        const landmarks = Ends.fromJSON(json.landmarks)
        return new Profile(json.label, landmarks, json.sub_landmarks || [], json.nbr_steps, Color(json.color))
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