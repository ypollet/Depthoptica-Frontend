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
    images: new Array<StackImage>(),
    zoomRect: {top: 0, left: 0, width: 0, height:0}
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
  subLandmarks: Array<Coords3D>,
  edgeThreshold?: string,
  color?: string
}


