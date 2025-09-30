<script setup lang="ts">
import { useImagesStore } from './lib/stores';
import ViewerView from './views/ViewerView.vue';

const imageStore = useImagesStore()


</script>

<template>
  <div class="overflow-hidden"> <ViewerView/></div>
</template>

