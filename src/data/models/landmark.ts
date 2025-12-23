import Color from "color"
import type { Coordinates, Coords3D } from "@/data/models/coordinates"
import type { ImageName } from "@/data/models/stack_image"

export type Pose = {
    x: number,
    y: number,
    depth: number,
    layer: number
}

export class Landmark {
    id: string
    label: string
    pos: Coordinates
    pose: Pose | null
    color: Color
    show: boolean
    edit: boolean

    
    constructor(id: string, label: string, pos : Coordinates, pose: Pose | null, color: Color | null = null) {
        this.id = id
        this.label = label
        this.pos = pos
        this.pose = pose
        this.edit = false
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
        this.show = true
    }

    equals(other : Landmark | string | null | undefined){
        if(other == null || other == undefined){
            return false
        }
        if(typeof other === "string"){
            return this.id == other
        }
        return this.id == other.id
    }

    toJSON() {
        return { id: this.id, label: this.label, color: this.color.hex(), pose: this.pose}
    }
    get depth(): Coords3D{
        return {
            x: this.pose?.x || 0,
            y: this.pose?.y || 0,
            z: this.pose?.depth || 0
        }
    }

    get layer(): Coords3D{
        return {
            x: this.pose?.x || 0,
            y: this.pose?.y || 0,
            z: this.pose?.layer || 0
        }
    }

    getId() : string {
        return this.id
    }
    getLabel() : string {
        return this.label
    }
    setLabel(label : string){
        this.label = label
    }
    
    getColorHEX() : string{
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

    setPose(pose : Pose) {
        this.pose = pose
    }
    
    getPose() : Pose | null{
        return this.pose
    }
    
    getEdit() : boolean{
        return this.edit
    }
    setEdit(edit : boolean){
        this.edit = edit
    }
}