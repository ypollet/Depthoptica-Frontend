<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { Landmark } from "@/data/models/landmark";

import draggable from "vuedraggable"

import { ref } from "vue";

import { storeToRefs } from "pinia";
import LandmarkIteration from "./LandmarkIteration.vue";

const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)


const scrollSnapType = ref<boolean>(true)

function removeLandmark(id: string) {
  selectedImage.value.store.landmarks = selectedImage.value.store.landmarks.filter((el) => !el.equals(id))
}

/*
function scaleVector(pose : Pose){
    if(selectedImage.value.pixelRatio != null && selectedImage.value.depthMin != null && selectedImage.value.depthMax != null){
         return scaleDepthRatio(pose, selectedImage.value.pixelRatio, selectedImage.value.depthMin, selectedImage.value.depthMax)
    }
    return {x : pose.x, y: pose.y, z:0}
}
*/
</script>

<template>
  <div ref="landmarksScroll" class="overflow-auto min-h-16 h-full w-full border"
    :class="{ 'scroll-snap-type': scrollSnapType }">
    <draggable ref="landmarksElements" v-model="selectedImage.store.landmarks" group="landmarks" item-key="id"
      :force-fallback="true" :animation="150" :scroll="true" :bubbleScroll="true" :handle="'.handle'"
      class="relative w-fit min-w-full" @start="scrollSnapType = false" @end="scrollSnapType = true">
      <template #item="{ element: landmark }: { element: Landmark }">
        <LandmarkIteration :landmark="landmark" @remove="removeLandmark" />
      </template>
    </draggable>
  </div>
</template>