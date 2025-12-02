import { Landmark, type Pose, type VectorPose } from "@/data/models/landmark"
import Color from "color"
import { distance_vector, type Coordinates, type DistanceVectors } from "./coordinates"
import { Deque } from "./structures"

export class Profile {
    label: string
    landmarks: Ends
    nbr_steps: number
    color: Color
    edit_label: boolean
    edit_profile: boolean
    show: boolean

    constructor(label: string, landmarks: Ends | null = null, nbr_steps: number | null = null, color: Color | null = null) {
        this.label = label
        this.landmarks = landmarks || new Ends
        this.nbr_steps = nbr_steps || 0
        this.edit_label = false
        this.edit_profile = false
        this.show = true
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
    }

    get sub_landmarks(): Coordinates[] | undefined {
        if (!this.landmarks.isFull()) {
            return undefined
        }
        let sub_landmarks: Coordinates[] = []
        let vector = {
            x: this.landmarks.last!.pose.x - this.landmarks.first!.pose.x,
            y: this.landmarks.last!.pose.y - this.landmarks.first!.pose.y
        }
        for (let i = 1; i <= this.nbr_steps; i++) {
            let marker = {
                x: this.landmarks.first!.pose.x + vector.x * i / (this.nbr_steps + 1),
                y: this.landmarks.first!.pose.y + vector.y * i / (this.nbr_steps + 1)
            }
            sub_landmarks.push(marker)
        }
        return sub_landmarks
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

        let landmarks = json.array.map((x: Landmark) => new Landmark(x.id, x.label, x.pose, Color(x.color)))
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
        console.log(landmark.label + " " + this.first!.label)
        console.log(landmark.label + " " + this.second?.label)
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