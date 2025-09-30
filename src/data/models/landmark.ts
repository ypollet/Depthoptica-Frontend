import Color from "color"
import type { Coordinates, Positions } from "@/data/models/coordinates"
import type { ImageName, StackImage } from "@/data/models/stack_image"

export type Pose = {
    marker: Coordinates
    image: ImageName,
    depth: number,
    layer: number
}



export class Landmark {
    id: string
    label: string
    pose: Pose
    positions : Positions
    color: Color
    show: boolean
    edit: boolean

    constructor(id: string, label: string, pose: Pose, positions : Positions, color: Color | null = null) {
        this.id = id
        this.label = label
        this.pose = pose
        this.positions = positions
        this.edit = false
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
        this.show = true
    }

    equals(other : Landmark | string | null){
        if(other == null){
            return false
        }
        if(typeof other === "string"){
            return this.id == other
        }
        return this.id == other.id
    }

    toJSON() {
        return { id: this.id, label: this.label, color: this.color.hex(), pose: this.pose, positions : this.positions }
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
        this.color = Color.rgb(color[0], color[1], color[2])
    }

    setPose(image : StackImage, pos: Coordinates, depth: number, layer: number) {
        this.pose = {
            marker : pos,
            image : image,
            depth: depth,
            layer: layer
        }
    }
    
    getPose() : Pose {
        return this.pose
    }

    setPosition(positions : Positions) {
        this.positions = positions
    }

    getPosition() : Positions {
        return this.positions
    }

    
    getEdit() : boolean{
        return this.edit
    }
    setEdit(edit : boolean){
        this.edit = edit
    }
}