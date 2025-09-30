<script setup lang="ts">
import { LandmarkList } from "@/components/ui/landmark";
import { DistanceComputed, DistanceList } from "@/components/ui/distance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useImagesStore, useLandmarksStore } from "@/lib/stores";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const imageStore = useImagesStore()
const landmarksStore = useLandmarksStore()

console.log(imageStore.$state)
</script>

<template>
  <div class="flex flex-col pb-[12px] w-auto h-full">
    <div class="flex-none space-y-4 py-4" v-if="imageStore.images != undefined">
      <ToggleGroup type="single" :model-value="imageStore.index.toString()" @update:modelValue="$event => imageStore.index = Number($event)">
        <ToggleGroupItem v-for="(stackedImage, index) in imageStore.images" :value="index.toString()">
          {{ stackedImage.label ?? "none" }}
        </ToggleGroupItem>
    </ToggleGroup>
    </div>
    <div class="flex-none space-y-4 py-4">

      <Tabs :model-value="landmarksStore.tab" @update:modelValue="$event => landmarksStore.tab = $event.toString()"
        default-value="landmarks" class="w-full my-4">
        <TabsList class="grid w-full grid-cols-2">
          <TabsTrigger value="landmarks">
            Landmarks
          </TabsTrigger>
          <TabsTrigger value="distances">
            Distances
          </TabsTrigger>
        </TabsList>
        <TabsContent value="landmarks">
          <LandmarkList />
        </TabsContent>
        <TabsContent value="distances">
          <DistanceList />
        </TabsContent>
      </Tabs>
    </div>
    <div class="flex grow items-end mt-4">
      <DistanceComputed />
    </div>
  </div>
</template>

<style>
.scroll-align {
  scroll-snap-align: start;
  scroll-behavior: auto;
}

.scroll-snap-type {
  scroll-snap-type: y mandatory;
}
</style>
