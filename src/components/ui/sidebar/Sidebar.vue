<script setup lang="ts">
import { LandmarkList } from "@/components/ui/landmark";
import { DistanceComputed, DistanceList } from "@/components/ui/distance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useImagesStore, useLandmarksStore } from "@/lib/stores";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ProfileList } from "../profile";
import ProfileComputed from "../profile/ProfileComputed.vue";

const imageStore = useImagesStore()
const landmarksStore = useLandmarksStore()

</script>

<template>
  <div class="flex flex-col pb-[12px] w-auto h-full">
    <div class="flex-none space-y-4 py-4" v-if="imageStore.images != undefined">
      <ToggleGroup type="single" :model-value="imageStore.index.toString()"
        @update:modelValue="$event => imageStore.index = Number($event)">
        <ToggleGroupItem v-for="(stackedImage, index) in imageStore.images" :value="index.toString()">
          {{ stackedImage.label ?? "none" }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div class="flex-none space-y-4 py-4">

      <Tabs :model-value="landmarksStore.tab" @update:modelValue="$event => landmarksStore.tab = $event.toString()"
        default-value="landmarks" class="w-full my-4">
        <TabsList class="grid w-full grid-cols-3">
          <TabsTrigger value="landmarks">
            Landmarks
          </TabsTrigger>
          <TabsTrigger value="distances">
            Distances
          </TabsTrigger>
          <TabsTrigger value="profiles">
            Profilometer
          </TabsTrigger>
        </TabsList>
        <TabsContent value="landmarks">
          <LandmarkList/>
        </TabsContent>
        <TabsContent value="distances">
          <DistanceList />
          <div class="flex grow items-end mt-4">
            <DistanceComputed />
          </div>
        </TabsContent>
        <TabsContent value="profiles">
          <ProfileList />
          <div class="flex grow items-end mt-4">
            <ProfileComputed />
          </div>
        </TabsContent>
      </Tabs>
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
