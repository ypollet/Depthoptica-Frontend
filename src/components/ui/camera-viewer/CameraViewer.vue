<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next';

import { useQuery } from '@tanstack/vue-query'

import { useImagesStore } from '@/lib/stores';

import { StackImage, type StackImageData } from '@/data/models/stack_image'

import ImageViewer from '@/components/ui/image-viewer/ImageViewer.vue';

import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"

import Label from '../label/Label.vue';

async function getImages(): Promise<Array<StackImage>> {
  if (imagesStore.images.length > 0) {
    try {
      return imagesStore.images as StackImage[]
    }catch(error){
      throw error
    }
    // reload depthmap and layer
    
  }
  imagesStore.index = 0
  return repository.getImages(imagesStore.objectPath).then(async (data) => {
    imagesStore.images = data.images.map((image: StackImageData) => {
      let stack_image = StackImage.fromData(image)
      
      return stack_image
    })
    return imagesStore.images as StackImage[]
  })
}


const repository = RepositoryFactory.get(repositorySettings.type)



const imagesStore = useImagesStore()

const { isPending, isError, data, error } = useQuery({
  queryKey: ['all_images'],
  queryFn: () => getImages(),
})


/*
function updateLandmarksDepth(){
  imagesStore.selectedImage.store.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.depth = imagesStore.getDepthData(pos, imagesStore.index)
  })
  imagesStore.selectedImage.store.distances.forEach((distance : Distance) => {
   distance.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.depth = imagesStore.getDepthData(pos, imagesStore.index)
   })
  })
  imagesStore.selectedImage.store.profiles.forEach((profile) => {
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
  imagesStore.selectedImage.store.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.layer = imagesStore.getLayerData(pos, imagesStore.index)
  })
  imagesStore.selectedImage.store.distances.forEach((distance : Distance) => {
   distance.landmarks.forEach((landmark : Landmark) => {
    let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.layer = imagesStore.getLayerData(pos, imagesStore.index)
   })
  })
  imagesStore.selectedImage.store.profiles.forEach((profile) => {
    profile.landmarks.forEach((landmark : Landmark) => {
      let pos = {
      x: landmark.pose.x,
      y: landmark.pose.y
    }
    landmark.pose.layer = imagesStore.getLayerData(pos, imagesStore.index)
    })
  })
}

*/
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