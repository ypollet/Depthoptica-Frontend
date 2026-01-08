import type { ProfileObject } from "@/lib/stores"
import { Distance } from "./distance"
import { Landmark } from "./landmark"
import { Ends, Profile } from "./profile"
import Color from "color"
import type { Coordinates } from "./coordinates"

export class Store {
    landmarks: Array<Landmark>
    distances: Array<Distance>
    profiles: Array<Profile>
    adjustFactor: number
    scale: string
    tab: string
    selectedDistanceIndex: number
    selectedProfileIndex: number

    constructor(landmarks : Array<Landmark> | null = null, distances : Array<Distance> | null = null, profiles : Array<Profile> | null = null, adjustFactor = 1, scale="mm", tab="landmarks", selectedDistanceIndex = -1, selectedProfileIndex = -1){
        this.landmarks = landmarks || Array<Landmark>()
        this.distances = distances || Array<Distance>()
        this.profiles = profiles || Array<Profile>()
        this.adjustFactor = adjustFactor
        this.scale = scale
        this.tab = tab
        this.selectedDistanceIndex = selectedDistanceIndex 
        this.selectedProfileIndex = selectedProfileIndex
    }

    get selectedDistance() : Distance | null{
        return  (this.selectedDistanceIndex >= 0 && this.selectedDistanceIndex < this.distances.length) ? this.distances[this.selectedDistanceIndex] as Distance : null
    }
     get selectedProfile() : Profile | null{
        return  (this.selectedProfileIndex >= 0 && this.selectedProfileIndex < this.profiles.length) ? this.profiles[this.selectedProfileIndex] as Profile : null
    }

    generateID() {
      let check: boolean = false
      let id: string = ""
      while (!check) {
        id = (Math.random() + 1).toString(36).substring(2);
        this.distances.forEach(distance => {
          if (distance.landmarks.filter(e => e.equals(id)).length == 0) {
            check = true
          }
        })
        if (this.landmarks.filter(e => e.equals(id)).length == 0) {
          check = true
        }
        this.profiles.forEach(profile => {
          profile.landmarks.forEach(e => {
            if(e.equals(id)){
              check = true
            }
          })
        })
      }
      return id;
    }

    toJSON() {
        return {
            landmarks: this.landmarks.map((landmark) => landmark.toJSON()),
            distances: this.distances.map((distance) => distance.toJSON()),
            profiles: this.profiles.map((profile) => profile.toJSON()),
            adjustFactor: this.adjustFactor,
            scale: this.scale,
            tab: this.tab,
            selectedDistanceIndex: this.selectedDistanceIndex,
            selectedProfileIndex: this.selectedProfileIndex,
        }
    }
}

export type StoreData = {
    landmarks: Array<Landmark>
    distances: Array<Distance>
    profiles: Array<ProfileObject>
    adjustFactor: number
    scale: string
    tab: string
    selectedDistanceIndex: number
    selectedProfileIndex: number
}

export type Camera = {
    zoom : number,
    offset :Coordinates,
}

export type Intrinsics = {
    fx : number,
    fy : number,
    cx : number,
    cy : number
}

export type StackImageData = {
    name: string,
    image: string,
    thumbnail: string,
    label: string,
    size: Size,
    camera : Camera | undefined,
    store : StoreData | undefined,
}
export class StackImage {
    name: string
    image: string
    thumbnail: string
    label: string
    size: Size
    camera : Camera
    store: Store

    static fromData(data : StackImageData){
        let store = undefined
        console.log(data.store)
        if(data.store != null){
            
            let landmarks = new Array<Landmark>()
            data.store.landmarks.forEach((jsonObject: Landmark) => {
                let landmark = new Landmark(jsonObject.id, jsonObject.label, jsonObject.pos, jsonObject.pose, Color(jsonObject.color))
                landmarks.push(landmark)
            })

            let distances = new Array<Distance>()
            data.store.distances.forEach((jsonObject: Distance) => {
                let landmarks = jsonObject.landmarks.map((x: Landmark) => new Landmark(x.id, x.label, x.pos, x.pose, Color(x.color)))
                let distance = new Distance(jsonObject.label, landmarks, Color(jsonObject.color))
                distances.push(distance)
            })

            let profiles = new Array<Profile>()
            data.store.profiles.forEach((jsonObject : ProfileObject) => {
                let profile = new Profile(jsonObject.label, Ends.fromJSON(jsonObject.landmarks), jsonObject.sub_landmarks, jsonObject.nbr_steps, Color(jsonObject.color))
                profiles.push(profile)
            })

            store = new Store(landmarks, distances, profiles, data.store.adjustFactor, data.store.scale, data.store.tab, data.store.selectedDistanceIndex, data.store.selectedProfileIndex)
        }


        return new StackImage(
            data.name,
            data.image,
            data.thumbnail,
            data.label,
            data.size,
            data.camera,
            store
        )
    }

    constructor(name: string,
        image: string,
        thumbnail: string,
        label: string,
        size: Size,
        camera : Camera | undefined = undefined,
        store: Store | undefined = undefined
        ) {
        this.name = name
        this.image = image
        this.thumbnail = thumbnail
        this.label = label
        this.size = size
        this.camera = camera || { zoom : -1, offset:{x:0, y:0} }
        this.store = store || new Store()
    }

    toJSON() {
        return {
            name: this.name,
            image: this.image,
            thumbnail: this.thumbnail,
            label: this.label,
            size: this.size,
            camera: this.camera,
            store: this.store.toJSON()
        }
    }
}

export type ImageName = {
    name: string,
    label: string,
}

export type Size = {
    height: number,
    width: number
}

export type ProjectData = {
    images: Array<StackImageData>,
    thumbnails: boolean,
}

export type Ratio = {
    height: number,
    width: number
}