<script setup lang="ts">
import { LandmarkList } from "@/components/ui/landmark";
import { DistanceComputed, DistanceList } from "@/components/ui/distance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useImagesStore } from "@/lib/stores";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ProfileList } from "../profile";
import ProfileComputed from "../profile/ProfileComputed.vue";
import { onMounted, ref } from "vue";
import { ThumbnailViewer } from "../thumbnail-viewer";

const imagesStore = useImagesStore()

const mounted = ref<boolean>(false)

onMounted(() => mounted.value = true)


</script>

<template>
  <div class="flex flex-col pb-[12px] w-auto h-full" v-if="mounted">
    <div class="flex justify-center">
      <div class="w-4/5">
        <ThumbnailViewer/>
      </div>
    </div>
    <div class="flex-none space-y-4 py-4" v-if="imagesStore.images != undefined">
      <ToggleGroup type="single" :model-value="imagesStore.index.toString()"
        @update:modelValue="$event => imagesStore.index = Number($event)">
        <ToggleGroupItem v-for="(stackedImage, index) in imagesStore.images" :value="index.toString()">
          {{ stackedImage.label ?? "none" }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div class="flex-none space-y-4 py-4">

      <Tabs :model-value="imagesStore.selectedImage.store.tab" @update:modelValue="$event => imagesStore.selectedImage.store.tab = $event.toString()"
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
