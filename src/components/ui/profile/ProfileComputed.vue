<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { Profile } from "@/data/models/profile";

import { Separator } from '@/components/ui/separator'
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";



import * as math from "mathjs"
import { Scale } from "@/lib/utils";
import { distance_vector, type Coordinates } from "@/data/models/coordinates";
import type { Pose } from "@/data/models/landmark";
import { storeToRefs } from "pinia";

const STEP = 0.01
const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)


function computeDistance(profile : Profile): number {
    if(!profile.landmarks.isFull() || profile.landmarks.first!.pose == null || profile.landmarks.last!.pose == null){
        return 0
    }
    let intervals : Pose[] = []
    let before : Pose = profile.landmarks.first!.pose
    profile.sub_landmarks!.forEach((landmark : Coordinates) => {
        let current : Pose = {
            x: landmark.x,
            y: landmark.y,
            depth: imagesStore.getDepthData(landmark, imagesStore.index),
            layer: imagesStore.getLayerData(landmark, imagesStore.index)
        }
        intervals.push(distance_vector(before, current))
        before = current
    })
    let last : Pose = profile.landmarks.last!.pose
    intervals.push(distance_vector(before, last))

    let dist = 0
    intervals.forEach((interval) => {
        let squared = math.map(Object.values(scaleVector(interval)), math.square)
        let sum = math.sum(squared)
        // can't be a Complex number
        dist += math.sqrt(sum) as number
    })

    return dist
}

function changeScale(payload: string | number, profile: Profile) {
    selectedImage.value.store.adjustFactor = math.number(payload) / computeDistance(profile) * math.number(Scale[selectedImage.value.store.scale as keyof typeof Scale])
}

function resetFactor() {
    selectedImage.value.store.adjustFactor = 1
}

function updateProfileSteps(steps : string | number, profile : Profile){
    profile.nbr_steps = math.number(steps)
}

function scaleVector(pose : Pose){
    /*
    if(selectedImage.value.pixelRatio != null && selectedImage.value.depthMin != null && selectedImage.value.depthMax != null){
         return scaleDepthRatio(pose, selectedImage.value.pixelRatio, selectedImage.value.depthMin, selectedImage.value.depthMax)
    }
         */
    return {x : pose.x, y: pose.y, z:pose.depth}
}
</script>

<template>
    <div class="w-full">
        <div class="flex flex-row ">
            <h2 class="flex items-center px-7 text-lg font-semibold tracking-tight">
                Measures
            </h2>
            <div class="w-full h-full flex justify-end space-x-2">
                <Select v-model=" selectedImage.store.scale">
                    <SelectTrigger class="w-16">
                        <SelectValue placeholder="Pick a scale" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Scale</SelectLabel>
                            <SelectItem v-for="scale in Object.keys(Scale).filter((v) => isNaN(Number(v)))"
                                :value="scale">
                                {{ scale }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button variant="secondary" @click="resetFactor">
                    Reset Scale
                </Button>
            </div>
        </div>
        <div class="flex flex-col min-h-48 min-w-full w-fit border">
            <div v-for="(profile) in selectedImage.store.profiles" class="flex flex-col min-w-full w-fit h-10">
                <div class="flex flex-row items-center justify-between space-x-3 px-3 w-full h-full">
                    <div class="flex flex-row items-center justify-start space-x-3">
                        <Label class="flex whitespace-nowrap w-auto">{{ profile.label }}</Label>
                    </div>
                    <div class="flex flex-row items-center justify-end space-x-3">
                        <Label class="flex whitespace-nowrap w-auto">Steps</Label>
                        <Input type="number" min="0" step="1" max="100" :model-value="profile.nbr_steps" class="flex w-max"
                            @update:model-value="updateProfileSteps($event, profile)"/>
                        <Label v-show="!profile.edit_profile" class="flex whitespace-nowrap w-auto"
                            @dblclick="profile.edit_profile = true">{{ math.round(((profile != null) ?
                                computeDistance(profile as Profile) * selectedImage.store.adjustFactor /
                                math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0), 5) }} {{
                                selectedImage.store.scale }}</Label>
                        <Input v-show="profile.edit_profile" type="number" :min="0" :step="STEP"
                            :model-value="(profile.sub_landmarks) ? computeDistance(profile as Profile) * selectedImage.store.adjustFactor / math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0"
                            class="flex h-auto w-auto px-0" @focusout="profile.edit_profile = false"
                            @keyup.enter="profile.edit_profile = false"
                            @update:model-value="changeScale($event, profile as Profile)" />
                    </div>
                </div>
                <Separator class="w-full" />
            </div>
        </div>
    </div>
</template>