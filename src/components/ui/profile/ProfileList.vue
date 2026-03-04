<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { ProfileIteration } from ".";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storeToRefs } from "pinia";
import { Profile } from "@/data/models/profile";

import { LineChart } from '@/components/ui/line-chart'
import { Circle } from "lucide-vue-next";
import Button from "../button/Button.vue";
import type { AcceptableValue } from "reka-ui";

const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)


function updateSelectedDist(payload: AcceptableValue) {
    if (payload !== null) {
        selectedImage.value.store.selectedProfileIndex = Number(payload)
    }
}
</script>

<template>
    <div class="flex grow w-full flex-col space-y-5">
        <div class="flex flex-row content-center space-x-4 ">
            <Select class="flex grow w-full" :model-value="selectedImage.store.selectedProfileIndex.toString()"
                @update:model-value="updateSelectedDist">
                <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pick a profile" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem class="h-8" value="-1">
                            <div class="flex flex-row space-x-2">
                                <Circle stroke-width="1" />
                                <span class="content-center">New..</span>
                            </div>

                        </SelectItem>
                        <SelectItem class="h-8" v-for="(profile, index) in selectedImage.store.profiles"
                            :value="index.toString()">
                            <div class="flex flex-row space-x-2">
                                <Circle stroke-width="1" :fill="profile.getColorHEX()" />
                                <span class="content-center">{{ profile.label }}</span>

                            </div>
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button variant="secondary" @click="updateSelectedDist('-1')">New..</Button>
        </div>
        <ProfileIteration v-if="selectedImage.store.selectedProfile != null"
            :profile="(selectedImage.store.selectedProfile as Profile)"
            :index="selectedImage.store.selectedProfileIndex" :showLandmarks="true" />
        <LineChart
            v-if="imagesStore.selectedImage.store.tab =='profiles' && selectedImage.store.selectedProfile != null && selectedImage.store.selectedProfile.landmarks.isFull()"
            id="profile" :profile="selectedImage.store.selectedProfile"
            :edgeThresholds="selectedImage.edgeThresholds" />
        <div
            v-for="(map) in selectedImage.store.profiles.map((profileMap, indexMap) => [profileMap, indexMap] as [Profile, number]).filter((map) => map[1] != selectedImage.store.selectedProfileIndex)">
            <ProfileIteration v-if="map[1] != selectedImage.store.selectedProfileIndex" :profile="(map[0] as Profile)"
                :index="map[1]" :showLandmarks="false"
                @dblclick="(e: MouseEvent) => { e.preventDefault(); selectedImage.store.selectedProfileIndex = map[1] }" />
        </div>
    </div>
</template>