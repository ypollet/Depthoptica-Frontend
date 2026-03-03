<script setup lang="ts">
import Menu from "@/components/Menu.vue";
import { Separator } from "@/components/ui/separator";
import { Sidebar } from "@/components/ui/sidebar";
import { useSettingsStore, useImagesStore } from "@/lib/stores";
import { CameraViewer } from "@/components/ui/camera-viewer"

const settingsStore = useSettingsStore()

const imagesStore = useImagesStore()


let urlParams = new URLSearchParams(window.location.search);

if(urlParams.has('series')){
  let seriesId = urlParams.get('series') as string
  if(imagesStore.objectPath != seriesId){
    imagesStore.setPath(seriesId)
  }
}
else{
  imagesStore.$reset()
}

</script>

<template>
  <main class="h-screen">
    <Menu class="sticky menu top-0 flex flex-row grow z-50"></Menu>
    <Separator></Separator>
    <div class="h-full flex"
    :class="settingsStore.isLeft ? 'flex-row' : 'flex-row-reverse'">
      <div class="rest_height overflow-auto sidebar border p-4">
        <Sidebar />
      </div>

      <div class="rest_width rest_height flex grow items-center justify-center">
        <CameraViewer/>
      </div>
    </div>
  </main>
</template>

<style scoped>
.menu {
  height: 60px;
}

.sidebar {
  width: 25%;
}

.rest_height {
  height: calc(100% - 61px);
}

.rest_width {
  width: 75%;
}
</style>
