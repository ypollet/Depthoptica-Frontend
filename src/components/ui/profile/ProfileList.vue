<script setup lang="ts">
import { useLandmarksStore } from "@/lib/stores";

import { ProfileIteration } from ".";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storeToRefs } from "pinia";
import { Ends, Profile, type EndsObject } from "@/data/models/profile";
import { onMounted } from "vue";
import Color from "color";

const landmarksStore = useLandmarksStore()

const { selectedProfileIndex } = storeToRefs(landmarksStore)

function updateSelectedDist(payload: string) {
    landmarksStore.selectedProfileIndex = Number(payload)
}

landmarksStore.profiles = landmarksStore.profiles.map((profile) => {
    if(!(profile instanceof Profile)){
        return new Profile(profile.label, profile.landmarks as Ends, profile.nbr_steps, Color(profile.color))
    }
    else{
        return profile
    }
})
</script>

<template>
    <div class="flex grow w-full flex-col space-y-5">
        <Select class="flex grow w-full" :model-value="selectedProfileIndex.toString()"
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
                    <SelectItem class="h-8" v-for="(profile, index) in landmarksStore.profiles"
                        :value="index.toString()">
                        {{ profile.label }}
                    </SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
        <ProfileIteration v-if="landmarksStore.selectedProfile != null"
            :profile="(landmarksStore.selectedProfile as Profile)" :index="landmarksStore.selectedProfileIndex"
            :showLandmarks="true" />
        <div
            v-for="(map) in landmarksStore.profiles.map((profileMap, indexMap) => [profileMap, indexMap] as [Profile, number]).filter((map) => map[1] != landmarksStore.selectedProfileIndex)">
            <ProfileIteration v-if="map[1] != landmarksStore.selectedProfileIndex" :profile="(map[0] as Profile)"
                :index="map[1]" :showLandmarks="false"
                @dblclick="(e: MouseEvent) => { e.preventDefault(); landmarksStore.selectedProfileIndex = map[1] }" />
        </div>
    </div>
</template>