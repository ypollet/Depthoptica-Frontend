<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

import { useQuery } from '@tanstack/vue-query'

import { useImagesStore, useLandmarksStore } from '@/lib/stores';

import { StackImage, type StackImageData } from '@/data/models/stack_image'

import ImageViewer from '@/components/ui/image-viewer/ImageViewer.vue';

import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"

import Label from '../label/Label.vue';
import type { Landmark } from '@/data/models/landmark';
import type { Distance } from '@/data/models/distance';
import type { Profile } from '@/data/models/profile';

async function getImages(): Promise<Array<StackImage>> {
  if (imagesStore.images.length > 0) {
    try {
      imagesStore.images = imagesStore.images.map((image: StackImage) => {
        image.depthmap = undefined
        image.layers = undefined
        const layers_canvas = new OffscreenCanvas(image.size.width, image.size.height)
        const depthmap_canvas = new OffscreenCanvas(image.size.width, image.size.height)
        let depth_ctx = depthmap_canvas.getContext("2d")!
        let layer_ctx = layers_canvas.getContext("2d")!
        if(image.has_depthmap || image.has_layers){
          if (image.has_depthmap) {
            repository.getDepthmap(imagesStore.objectPath, image.name).then((depthmap_src) => {
              let depthmap = new Image()
              depthmap.src = depthmap_src

              depthmap.onload = async () => {
                depth_ctx.drawImage(depthmap, 0, 0);
                image.depthmap = depth_ctx.getImageData(0, 0, depthmap.naturalWidth, depthmap.naturalHeight)
                updateLandmarksDepth()
              }
            })
          }
          if (image.has_layers) {
            repository.getLayers(imagesStore.objectPath, image.name).then((layers_src) => {
              let layers = new Image()
              layers.src = layers_src
              layers.onload = async () => {
                layer_ctx.drawImage(layers, 0, 0);
                image.layers = layer_ctx.getImageData(0, 0, layers.naturalWidth, layers.naturalHeight)
                updateLandmarksLayers()
              }
            })
          }
          
        }
        
        return image
      })
      return imagesStore.images
    }catch(error){
      console.log(error)
      throw error
    }
    // reload depthmap and layer
    
  }
  imagesStore.index = 0
  return repository.getImages(imagesStore.objectPath).then(async (data) => {

    imagesStore.images = data.images.map((image: StackImageData) => {
      let stack_image = {
        name: image.name,
        image: image.image,
        thumbnail: image.thumbnail,
        label: image.label,
        size: image.size,
        has_layers: image.has_layers,
        has_depthmap: image.has_depthmap,
        layers: undefined,
        depthmap: undefined,
        depthMin: image.depthMin,
        depthMax: image.depthMax,
        layerThickness: image.layerThickness,
        pixelRatio: image.pixelRatio
      } as StackImage

      const layers_canvas = new OffscreenCanvas(image.size.width, image.size.height)
      const depthmap_canvas = new OffscreenCanvas(image.size.width, image.size.height)
      let depth_ctx = depthmap_canvas.getContext("2d")!
      let layer_ctx = layers_canvas.getContext("2d")!

      if (image.has_depthmap) {
        repository.getDepthmap(imagesStore.objectPath, image.name).then((depthmap_src) => {
          let depthmap = new Image()
          depthmap.src = depthmap_src
          
          depthmap.onload = async () => {
            depth_ctx.drawImage(depthmap, 0, 0);
            stack_image.depthmap = depth_ctx.getImageData(0, 0, depthmap.naturalWidth, depthmap.naturalHeight)
          }
        })

      }
      if (image.has_layers) {
        repository.getLayers(imagesStore.objectPath, image.name).then((layers_src) => {
          let layers = new Image()
          layers.src = layers_src
          layers.onload = async () => {
            layer_ctx.drawImage(layers, 0, 0);
            stack_image.layers = layer_ctx.getImageData(0, 0, layers.naturalWidth, layers.naturalHeight)
          }
        })
      }

      return stack_image
    })

    return imagesStore.images
  })
}


const repository = RepositoryFactory.get(repositorySettings.type)



const imagesStore = useImagesStore()
const landmarkStore = useLandmarksStore()



const { isPending, isError, data, error } = useQuery({
  queryKey: ['all_images'],
  queryFn: () => getImages(),
})


function updateLandmarksDepth(){
  landmarkStore.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.depth = imagesStore.getDepthData(pos, imagesStore.index)
  })
  landmarkStore.distances.forEach((distance : Distance) => {
   distance.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.depth = imagesStore.getDepthData(pos, imagesStore.index)
   })
  })
  landmarkStore.profiles.forEach((profile) => {
    profile.landmarks.forEach((landmark) => {
      let pos = {
        x: landmark.pose.x,
        y: landmark.pose.y
      }
      landmark.pose.depth = imagesStore.getDepthData(pos, imagesStore.index)
    })
  })
}

function updateLandmarksLayers(){
  landmarkStore.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.layer = imagesStore.getLayerData(pos, imagesStore.index)
  })
  landmarkStore.distances.forEach((distance : Distance) => {
   distance.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.layer = imagesStore.getLayerData(pos, imagesStore.index)
   })
  })
  landmarkStore.profiles.forEach((profile) => {
    profile.landmarks.forEach((landmark : Landmark) => {
      let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.layer = imagesStore.getLayerData(pos, imagesStore.index)
    })
  })
}

</script>
<template>
  <div class="w-full h-full border flex justify-center items-center">
    <div v-if="isPending" class="w-full h-full flex justify-center items-center">
      <Loader2 class="animate-spin mr-10" width="10%" height="10%" />
    </div>
    <div v-if="isError" class="w-full h-full flex justify-center items-center">
      <div class="text-red-600">{{ error }}</div>
    </div>
    <div v-if="data" class="w-full h-full flex flex-col items-center">
      <div class="flex grow flex-row w-full justify-start">
        <Label class="border p-2">{{ imagesStore.selectedImage!.label }}</Label>
      </div>
      <ImageViewer class="object-fit" aspect-ratio="auto" draggable="false" />
    </div>
  </div>
</template>

<style scoped>
.object-fit {
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  display: block;
}
</style>