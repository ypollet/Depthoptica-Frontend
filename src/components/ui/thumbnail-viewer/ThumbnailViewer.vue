<!-- 
Sphaeroptica - 3D Viewer on calibrated images - Frontend

Copyright (C) 2024 Yann Pollet, Royal Belgian Institute of Natural Sciences


This program is free software: you can redistribute it and/or

modify it under the terms of the GNU General Public License as

published by the Free Software Foundation, either version 3 of the

License, or (at your option) any later version.



This program is distributed in the hope that it will be useful, but

WITHOUT ANY WARRANTY; without even the implied warranty of

MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU

General Public License for more details.


You should have received a copy of the GNU General Public License

along with this program. If not, see <http://www.gnu.org/licenses/>. 
-->

<script setup lang="ts">

import { onMounted, ref, watch } from 'vue';

import { storeToRefs } from 'pinia';
import { round } from 'mathjs'
import { useImagesStore } from '@/lib/stores';

const imagesStore = useImagesStore()

const { selectedImage } = storeToRefs(imagesStore)

const scaledZoomRect = ref<{
  top: number;
  left: number;
  width: number;
  height: number;
}>(imagesStore.zoomRect)

const base_image = ref<HTMLImageElement | null>(null)
const imageContainer = ref<HTMLDivElement | null>(null)

const isZoomedOut = ref<boolean>(true)

watch(() => imagesStore.zoomRect, () => {
  updateRect()
})

onMounted(() => {
  updateRect()
})

function updateRect() {
  if (imageContainer.value && base_image.value && base_image.value.complete) {
    let ratioW = selectedImage.value.size.width / imageContainer.value.clientWidth
    let ratioH = selectedImage.value.size.height / imageContainer.value.clientHeight

    scaledZoomRect.value = {
      top: imagesStore.zoomRect.top / ratioH,
      left: imagesStore.zoomRect.left / ratioW,
      width: imagesStore.zoomRect.width / ratioW,
      height: imagesStore.zoomRect.height / ratioH
    }

    isZoomedOut.value = round(imagesStore.zoomRect.width, 3) != round(selectedImage.value.size.width, 3) || round(imagesStore.zoomRect.height, 3) != round(selectedImage.value.size.height, 3)
  }
}
</script>
<template>
    <div ref="imageContainer" class="w-full h-auto border flex justify-center items-center relative">
      <div class="absolute bottom-0 left-0 w-full h-full">
        <svg v-if="isZoomedOut" class="w-full h-full">
          <rect id="box" :x="scaledZoomRect.left" :y="scaledZoomRect.top" :width="scaledZoomRect.width"
            :height="scaledZoomRect.height" />
        </svg>
      </div>
      <img class="object-fit" ref="base_image"
        :src="imagesStore.selectedImage.thumbnail || imagesStore.selectedImage.image"
        :alt="imagesStore.selectedImage.name" aspect-ratio="auto" draggable="false">
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

#box {
  position: absolute;
  fill: transparent;
  stroke: red;
  stroke-width: 3;
}
</style>