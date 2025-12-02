import { acceptHMRUpdate, defineStore, type PiniaPluginContext, type StateTree } from 'pinia'
import { Distance } from '@/data/models/distance'
import { Landmark, type VectorPose } from '@/data/models/landmark'
import Color from 'color'
import { StackImage, type StackImageData } from '@/data/models/stack_image'
import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from '@/config/appSettings'
import { Ends, Profile, type EndsObject } from '@/data/models/profile'
import destr from "destr"
import type { Coordinates } from '@/data/models/coordinates'
import { round } from 'mathjs'

const repository = RepositoryFactory.get(repositorySettings.type)

const DEF_SIZE = 200
export const DEFAULT_TAB = "viewer"

const DEFAULT_IMG: StackImage = new StackImage(
  "RBINS Logo",
  "RBINS",
  "",
  "https://www.naturalsciences.be/bundles/8c62adb1e0fbef009ef7c06c69a991890012e203/img/logos/logo.svg",
  { height: DEF_SIZE, width: DEF_SIZE },
  false,
  false,
  undefined,
  undefined,
  1,
  0,
  1,
  { width: 1, height: 1 }
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
    zoom: -1,
    offset: { x: 0, y: 0 }
  }),
  getters: {
    selectedImage: (state) => (state.index >= 0 && state.index < state.images.length) ? state.images[state.index]! : DEFAULT_IMG
  },
  actions: {
    setPath(path: string) {
      this.$reset()
      this.objectPath = path
    },
    getDepthData(pos: Coordinates, index: number) {
      let image = (index >= 0 && index < this.images.length) ? this.images[index]! : DEFAULT_IMG
      // images on canvas are always RGBA
      if (image.depthmap == undefined) {
        return 0
      }
      let rounded_pos = {
        x: round(pos.x),
        y: round(pos.y)
      }
      return image.depthmap.data[rounded_pos.y * image.depthmap.width * 4 + (rounded_pos.x * 4)]!
    },
    getLayerData(pos: Coordinates, index: number) {
      let image = (index >= 0 && index < this.images.length) ? this.images[index]! : DEFAULT_IMG
      // images on canvas are always RGBA
      if (image.layers == undefined) {
        return 0
      }
      let rounded_pos = {
        x: round(pos.x),
        y: round(pos.y)
      }
      return image.layers.data[rounded_pos.y * image.layers.width * 4 + (rounded_pos.x * 4)]!
    }
  },

  persist: {
    storage: sessionStorage,
    key: 'images',
    debug: true,
    afterHydrate: (ctx) =>{
      let images = new Array<StackImage>()
      ctx.store.$state.images.forEach((jsonObject: StackImageData) => {
        let image = StackImage.fromData(jsonObject)
        images.push(image)
      })
      ctx.store.$state.images = images
    }
  }
})

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
/*
{
  landmarks: Array<Landmark>(),
  distances: Array<Distance>(),
  profiles: Array<Profile>(),
  profile_steps: Array<number>(),
  adjustFactor: 1,
  scale: "mm",
  tab: "landmarks",
  selectedDistanceIndex: -1,
  selectedProfileIndex: -1
}
  */

export type ProfileObject = {
  label: string
  landmarks: EndsObject
  nbr_steps: number,
  color: string
}


