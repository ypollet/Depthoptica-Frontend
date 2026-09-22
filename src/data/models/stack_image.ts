import { Distance, type DistanceObject } from "./distance"
import { Landmark, type LandmarkObject } from "./landmark"
import { Ends, Profile, type ProfileObject } from "./profile"
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

    constructor(landmarks: Array<Landmark> | null = null, distances: Array<Distance> | null = null, profiles: Array<Profile> | null = null, adjustFactor = 1, scale = "mm", tab = "landmarks", selectedDistanceIndex = -1, selectedProfileIndex = -1) {
        this.landmarks = landmarks || Array<Landmark>()
        this.distances = distances || Array<Distance>()
        this.profiles = profiles || Array<Profile>()
        this.adjustFactor = adjustFactor
        this.scale = scale
        this.tab = tab
        this.selectedDistanceIndex = selectedDistanceIndex
        this.selectedProfileIndex = selectedProfileIndex
    }

    get selectedDistance(): Distance | null {
        return (this.selectedDistanceIndex >= 0 && this.selectedDistanceIndex < this.distances.length) ? this.distances[this.selectedDistanceIndex] as Distance : null
    }
    get selectedProfile(): Profile | null {
        return (this.selectedProfileIndex >= 0 && this.selectedProfileIndex < this.profiles.length) ? this.profiles[this.selectedProfileIndex] as Profile : null
    }

    updateStore(other: Store) {
        console.log("Updating landmarks")
        other.landmarks.forEach((new_landmark) => {
            if (!this.checkUniqueID(new_landmark.id)) {
                new_landmark.id = this.generateID()
            }
            this.landmarks.push(new_landmark)
        })

        console.log("updating distances")
        let oldDistanceLen = this.distances.length
        other.distances.forEach((new_distance) => {
            new_distance.landmarks.forEach((new_landmark) => {
                if (!this.checkUniqueID(new_landmark.id)) {
                    new_landmark.id = this.generateID()
                }
            })
            this.distances.push(new_distance)
        })

        console.log("updating profiles")
        let oldProfileLen = this.profiles.length
        other.profiles.forEach((new_profile) => {
            new_profile.landmarks.forEach((new_landmark) => {
                if (!this.checkUniqueID(new_landmark.id)) {
                    new_landmark.id = this.generateID()
                }
            })
            this.profiles.push(new_profile)
        })

        console.log("Updating the rest")

        this.adjustFactor = other.adjustFactor
        this.scale = other.scale
        this.tab = other.tab
        this.selectedDistanceIndex = oldDistanceLen + other.selectedDistanceIndex
        this.selectedProfileIndex = oldProfileLen + other.selectedProfileIndex

        console.log("Distances", this.selectedDistanceIndex,  oldDistanceLen,  other.selectedDistanceIndex)
        console.log("Profiles", this.selectedProfileIndex,  oldProfileLen,  other.selectedProfileIndex)
    }

    checkUniqueID(id: string): boolean {
        if (this.landmarks.filter(e => e.equals(id)).length != 0) {
            return false
        }
        let checkDistances = this.distances.map(distance => {
            if (distance.landmarks.filter(e => e.equals(id)).length != 0) {
                return false
            }
            return true
        })

        if (!checkDistances.every(v => v == true)) {
            return false
        }

        let checkProfiles = this.profiles.map((profile) => {
            if (profile.landmarks.contains(id)) {
                return false
            }
            return true
        })
        return checkProfiles.every(v => v == true)
    }

    generateID() {
        let id: string = (Math.random() + 1).toString(36).substring(2);
        while (!this.checkUniqueID(id)) {
            id = (Math.random() + 1).toString(36).substring(2);
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

    static fromJSON(jsonObject: StoreObject) {
        return new Store(jsonObject.landmarks.map((landmarkObject) => Landmark.fromJSON(landmarkObject)),
            jsonObject.distances.map((distanceObject) => Distance.fromJSON(distanceObject)),
            jsonObject.profiles.map((profileObject) => Profile.fromJSON(profileObject)),
            jsonObject.adjustFactor,
            jsonObject.scale,
            jsonObject.tab,
            jsonObject.selectedDistanceIndex,
            jsonObject.selectedProfileIndex
        )
    }
}

export type StoreObject = {
    landmarks: Array<LandmarkObject>
    distances: Array<DistanceObject>
    profiles: Array<ProfileObject>
    adjustFactor: number
    scale: string
    tab: string
    selectedDistanceIndex: number
    selectedProfileIndex: number
}

export type Camera = {
    zoom: number,
    offset: Coordinates
}

export type Intrinsics = {
    fx: number,
    fy: number,
    cx: number,
    cy: number
}

export type StackImageObject
    = {
        name: string,
        image: string,
        thumbnail: string,
        size: Size,
        edgeThresholds: Array<string>
        camera: Camera | undefined,
        store: StoreObject | undefined,
    }

export type Rect = {
    top: number,
    left: number,
    width: number,
    height: number,
}
export class StackImage {
    name: string
    image: string
    thumbnail: string
    size: Size
    edgeThresholds: Array<string>
    camera: Camera
    store: Store


    static fromJSON(data: StackImageObject) {
        let store = undefined
        if (data.store != null) {

            let landmarks = new Array<Landmark>()
            data.store.landmarks.forEach((jsonObject: LandmarkObject) => {
                landmarks.push(Landmark.fromJSON(jsonObject))
            })

            let distances = new Array<Distance>()
            data.store.distances.forEach((jsonObject: DistanceObject) => {
                distances.push(Distance.fromJSON(jsonObject))
            })

            let profiles = new Array<Profile>()
            data.store.profiles.forEach((jsonObject: ProfileObject) => {
                let profile = new Profile(jsonObject.label, Ends.fromJSON(jsonObject.landmarks), jsonObject.subLandmarkSegments, jsonObject.edgeThreshold, jsonObject.smooth, Color(jsonObject.color))
                profiles.push(profile)
            })

            store = new Store(landmarks, distances, profiles, data.store.adjustFactor, data.store.scale, data.store.tab, data.store.selectedDistanceIndex, data.store.selectedProfileIndex)
        }


        return new StackImage(
            data.name,
            data.image,
            data.thumbnail,
            data.size,
            data.edgeThresholds,
            data.camera,
            store
        )
    }

    constructor(name: string,
        image: string,
        thumbnail: string,
        size: Size,
        edgeThresholds: Array<string> | undefined = undefined,
        camera: Camera | undefined = undefined,
        store: Store | undefined = undefined
    ) {
        this.name = name
        this.image = image
        this.thumbnail = thumbnail
        this.size = size
        this.edgeThresholds = edgeThresholds ?? []
        this.camera = camera || { zoom: -1, offset: { x: 0, y: 0 } }
        this.store = store || new Store()
    }

    toJSON() {
        return {
            name: this.name,
            image: this.image,
            thumbnail: this.thumbnail,
            size: this.size,
            edgeThresholds: this.edgeThresholds,
            camera: this.camera,
            store: this.store.toJSON()
        }
    }
}

export type ImageName = {
    name: string,
    image: string,
}

export type Size = {
    height: number,
    width: number
}

export type ProjectObject = {
    images: Array<StackImageObject>,
    thumbnails: boolean,
}

export type Ratio = {
    height: number,
    width: number
}