<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { ProfileIteration } from ".";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storeToRefs } from "pinia";
import { Profile } from "@/data/models/profile";

import { LineChart } from '@/components/ui/line-chart'

const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)


function updateSelectedDist(payload: string) {
    selectedImage.value.store.selectedProfileIndex = Number(payload)
}
</script>

<template>
    <div class="flex grow w-full flex-col space-y-5">
        <Select class="flex grow w-full" :model-value="selectedImage.store.selectedProfileIndex.toString()"
            @update:model-value="updateSelectedDist">
            <SelectTrigger class="w-full">
                <SelectValue placeholder="Pick a profile" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Scale</SelectLabel>
                    <SelectItem class="h-8" value="-1">
                        New..
                    </SelectItem>
                    <SelectItem class="h-8" v-for="(profile, index) in selectedImage.store.profiles"
                        :value="index.toString()">
                        {{ profile.label }}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
        <ProfileIteration v-if="selectedImage.store.selectedProfile != null"
            :profile="(selectedImage.store.selectedProfile as Profile)" :index="selectedImage.store.selectedProfileIndex"
            :showLandmarks="true" />
        <LineChart v-if="selectedImage.store.selectedProfile != null && selectedImage.store.selectedProfile.landmarks.isFull()"
                    id="profile" 
                    :profile="selectedImage.store.selectedProfile"/>
        <div
            v-for="(map) in selectedImage.store.profiles.map((profileMap, indexMap) => [profileMap, indexMap] as [Profile, number]).filter((map) => map[1] != selectedImage.store.selectedProfileIndex)">
            <ProfileIteration v-if="map[1] != selectedImage.store.selectedProfileIndex" :profile="(map[0] as Profile)"
                :index="map[1]" :showLandmarks="false"
                @dblclick="(e: MouseEvent) => { e.preventDefault(); selectedImage.store.selectedProfileIndex = map[1] }" />
        </div>
    </div>
</template>