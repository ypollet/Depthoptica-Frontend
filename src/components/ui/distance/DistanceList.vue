<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { DistanceIteration } from ".";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storeToRefs } from "pinia";
import { Distance } from "@/data/models/distance";
import { Circle } from "lucide-vue-next";
import Button from "../button/Button.vue";
import type { AcceptableValue } from "reka-ui";
import Separator from "../separator/Separator.vue";

const imagesStore = useImagesStore()

const { selectedImage } = storeToRefs(imagesStore)

function updateSelectedDist(payload: AcceptableValue) {
    selectedImage.value.store.selectedDistanceIndex = Number(payload)
}
</script>

<template>
    <div class="flex grow w-full flex-col space-y-5">
        <div class="flex flex-row content-center space-x-4 ">

            <Select class="flex grow w-full" :model-value="selectedImage.store.selectedDistanceIndex.toString()"
                @update:model-value="updateSelectedDist">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pick a distance" />
                </SelectTrigger>
                <SelectContent class="w-full">
                    <SelectGroup>
                        <SelectItem class="h-8" value="-1">
                            <div class="flex flex-row space-x-2">
                                <Circle stroke-width="1" />
                                <span class="content-center">New..</span>
                            </div>
                        </SelectItem>
                        <SelectItem class="h-8" v-for="(distance, index) in selectedImage.store.distances"
                            :value="index.toString()">
                            <div class="flex flex-row space-x-2">
                                <Circle stroke-width="1" :fill="distance.getColorHEX()" />
                                <span class="content-center">{{ distance.label }}</span>
                            </div>
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button variant="secondary" @click="updateSelectedDist('-1')">New..</Button>
        </div>
        <DistanceIteration v-if="selectedImage.store.selectedDistance != null"
            :distance="selectedImage.store.selectedDistance" :index="selectedImage.store.selectedDistanceIndex"
            :showLandmarks="true" />
        <Separator class="bg-gray-400"/>
        <div
            v-for="(map) in selectedImage.store.distances.map((distanceMap, indexMap) => [distanceMap, indexMap] as [Distance, number]).filter((map) => map[1] != selectedImage.store.selectedDistanceIndex)">
            <DistanceIteration v-if="map[1] != selectedImage.store.selectedDistanceIndex" :distance="map[0]"
                :index="map[1]" :showLandmarks="false"/>
        </div>
    </div>
</template>