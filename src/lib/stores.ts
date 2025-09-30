import { defineStore, type PiniaPluginContext, type StateTree } from 'pinia'
import { Distance } from '@/data/models/distance'
import { Landmark } from '@/data/models/landmark'
import Color from 'color'
import type { StackImage, Size } from '@/data/models/stack_image'
import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from '@/config/appSettings'
import { destr } from "destr";

const repository = RepositoryFactory.get(repositorySettings.type)

const DEF_SIZE = 200
export const DEFAULT_TAB = "viewer"

const DEFAULT_IMG: StackImage = {
  name: "RBINS Logo",
  label: "RBINS",
  thumbnail: "",
  image: "https://www.naturalsciences.be/bundles/8c62adb1e0fbef009ef7c06c69a991890012e203/img/logos/logo.svg",
  size: { height: DEF_SIZE, width: DEF_SIZE },
  layers: "",
  depthmap: ""
}

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
    selectedImage: (state) => (state.index >= 0 && state.index < state.images.length) ? state.images[state.index] : DEFAULT_IMG
  },
  actions: {
    setPath(path: string) {
      this.$reset()
      this.objectPath = path
    }
  },

  persist: {
    storage: sessionStorage,
    key: 'images',
    debug:true,
    afterHydrate: (ctx: PiniaPluginContext) => {
      console.log("Hydrate")
      console.log(ctx.store.$state)
      console.log(ctx.store.$state.objectPath)
    }
  },
})

export const useLandmarksStore = defineStore('landmarks', {
  state: () => ({
    landmarks: Array<Landmark>(),
    distances: Array<Distance>(),
    adjustFactor: 1,
    scale: "mm",
    tab: "landmarks",
    selectedDistanceIndex: -1
  }),
  getters: {
    indexes: (state) => new Map(state.distances.map((distance, index) => [distance.label, index])),
    selectedDistance: (state) => (state.selectedDistanceIndex >= 0 && state.selectedDistanceIndex < state.distances.length) ? state.distances[state.selectedDistanceIndex] : null
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
        let landmark = new Landmark(jsonObject.id, jsonObject.label, jsonObject.pose, jsonObject.positions, Color(jsonObject.color))
        landmarks.push(landmark)
      })
      ctx.store.$state.landmarks = landmarks

      let distances = new Array<Distance>()
      ctx.store.$state.distances.forEach((jsonObject: Distance) => {
        let landmarks = jsonObject.landmarks.map((x: Landmark) => new Landmark(x.id, x.label, x.pose, x.positions, Color(x.color)))
        let distance = new Distance(jsonObject.label, landmarks, Color(jsonObject.color))
        distances.push(distance)
      })
      ctx.store.$state.distances = distances
    },
  },
})