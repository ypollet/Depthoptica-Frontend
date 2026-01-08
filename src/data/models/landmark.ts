import Color from "color"
import { vectorToString, type Coordinates, type Coords3D } from "@/data/models/coordinates"

export class Landmark {
    id: string
    label: string
    pos: Coordinates
    pose: Coords3D
    color: Color
    show: boolean
    edit: boolean

    
    constructor(id: string, label: string, pos : Coordinates, pose: Coords3D, color: Color | null = null) {
        this.id = id
        this.label = label
        this.pos = pos
        this.pose = pose
        this.edit = false
        this.color = color || Color.rgb([Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)])
        this.show = true
    }

    get show_pose() : string{
        return vectorToString(this.pose || { x: 0, y: 0, z:0})
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
        return { id: this.id, label: this.label, color: this.color.hex(), pos: this.pos, pose: this.pose}
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

    setPose(pose : Coords3D) {
        this.pose = pose
    }
    
    getPose() : Coords3D | null{
        return this.pose
    }
    
    getEdit() : boolean{
        return this.edit
    }
    setEdit(edit : boolean){
        this.edit = edit
    }
}