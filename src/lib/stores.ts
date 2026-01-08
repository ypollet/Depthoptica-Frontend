import { defineStore, type StateTree } from 'pinia'
import { Distance } from '@/data/models/distance'
import { Landmark } from '@/data/models/landmark'
import Color from 'color'
import { StackImage, type StackImageData } from '@/data/models/stack_image'
import {  Profile, type EndsObject } from '@/data/models/profile'
import destr from "destr"
import type { Coords3D } from '@/data/models/coordinates'

const DEF_SIZE = 200
export const DEFAULT_TAB = "viewer"

const DEFAULT_IMG: StackImage = new StackImage(
  "RBINS Logo",
  "https://www.naturalsciences.be/bundles/8c62adb1e0fbef009ef7c06c69a991890012e203/img/logos/logo.svg",
  "",
  "RBINS",
  { height: DEF_SIZE, width: DEF_SIZE },
)

export const useSettingsStore = defineStore('settings', {
  state: () => ({ isLeft: false }),
  actions: {
    useToggleLeft(value: boolean) {
      this.isLeft = value
    },
  },

  persist: {
    storage: localStorage,
    key: 'settings',
  }
})


export const useImagesStore = defineStore('images', {
  state: () => ({
    objectPath: "",
    index: 0,
    images: new Array<StackImage>()
  }),
  getters: {
    selectedImage: (state) => (state.index >= 0 && state.index < state.images.length) ? state.images[state.index]! as StackImage : DEFAULT_IMG
  },
  actions: {
    setPath(path: string) {
      this.$reset()
      this.objectPath = path
    },
  },

  persist: {
    storage: sessionStorage,
    key: 'images',
    debug: true,
    afterHydrate: (ctx) =>{
      
    },
    serializer:{
      serialize: (data : StateTree) => {
        // Build a plain, serializable object with only the fields we need
        try {

          const images = (data.images ?? []).map((image: any) => (image instanceof StackImage) ? image.toJSON() : image)
          const out: any = {
            objectPath: (data as any).objectPath,
            index: (data as any).index,
            images,
          }
          return JSON.stringify(out)
        } catch (e) {
          console.error('serialize error', e)
          // Fallback: return minimal safe state
          return JSON.stringify({ images: [] })
        }
      },
      deserialize: (data) => {
        let state : StateTree = destr(data)
        let images = new Array<StackImage>()
        state.images.forEach((jsonObject: StackImageData) => {
          let image = StackImage.fromData(jsonObject)
          images.push(image)
        })
        state.images = images
        return state
      }
    }
  }
})

/*
export const useLandmarksStore = defineStore('landmarks', {
  state: () => (
    {
      landmarks: Array<Landmark>(),
      distances: Array<Distance>(),
      profiles: Array<Profile>(),
      adjustFactor: 1,
      scale: "mm",
      tab: "landmarks",
      selectedDistanceIndex: -1,
      selectedProfileIndex: -1
    }
  ),
  getters: {
    distanceIndexes: (state) => new Map(state.distances.map((distance, index) => [distance.label, index])),
    selectedDistance: (state) => (state.selectedDistanceIndex >= 0 && state.selectedDistanceIndex < state.distances.length) ? state.distances[state.selectedDistanceIndex] as Distance : null,
    profileIndexes: (state) => new Map(state.profiles.map((profile, index) => [profile.label, index])),
    selectedProfile: (state) => (state.selectedProfileIndex >= 0 && state.selectedProfileIndex < state.profiles.length) ? state.profiles[state.selectedProfileIndex] as Profile : null

  },
  actions: {
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
    },
  },
  persist: {
    storage: sessionStorage,
    key: 'landmarks',
    afterHydrate: (ctx: PiniaPluginContext) => {
      // restore landmarks
      let landmarks = new Array<Landmark>()
      ctx.store.$state.landmarks.forEach((jsonObject: Landmark) => {
        let landmark = new Landmark(jsonObject.id, jsonObject.label, jsonObject.pose, Color(jsonObject.color))
        landmarks.push(landmark)
      })
      ctx.store.$state.landmarks = landmarks

      let distances = new Array<Distance>()
      ctx.store.$state.distances.forEach((jsonObject: Distance) => {
        let landmarks = jsonObject.landmarks.map((x: Landmark) => new Landmark(x.id, x.label, x.pose, Color(x.color)))
        let distance = new Distance(jsonObject.label, landmarks, Color(jsonObject.color))
        distances.push(distance)
      })
      ctx.store.$state.distances = distances

      let profiles = new Array<Profile>()
      ctx.store.$state.profiles.forEach((jsonObject: ProfileObject) => {
        let profile = new Profile(jsonObject.label, Ends.fromJSON(jsonObject.landmarks), jsonObject.nbr_steps, Color(jsonObject.color))
        profiles.push(profile)
      })
      ctx.store.$state.profiles = profiles

    },

  }
})

*/

export type LandmarkInfo = {
  landmarks: Array<Landmark>,
  distances: Array<Distance>,
  profiles: Array<Profile>,
  profile_steps: Array<number>,
  adjustFactor: number,
  scale: string,
  tab: string,
  selectedDistanceIndex: number,
  selectedProfileIndex: number
}

export type ProfileObject = {
  label: string
  landmarks: EndsObject
  nbr_steps: number,
  sub_landmarks: Array<Coords3D>,
  color: string
}


