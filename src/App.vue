<script setup lang="ts">
import { useImagesStore } from './lib/stores';
import ViewerView from './views/ViewerView.vue';

const imageStore = useImagesStore()

function changePicture(event: KeyboardEvent) {
  let key = event.key
  if(key == "ArrowUp"){
    imageStore.increment()
  }
  if(key == "ArrowDown"){
    imageStore.decrement()
  }
}
</script>

<template>
  <div class="overflow-hidden"> <ViewerView @keydown="changePicture"/></div>
</template>

