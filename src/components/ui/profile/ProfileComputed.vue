<script setup lang="ts">
import { useImagesStore, useLandmarksStore } from "@/lib/stores";

import { Profile } from "@/data/models/profile";

import { Separator } from '@/components/ui/separator'
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";


import { X } from "lucide-vue-next";

import * as math from "mathjs"
import { Scale } from "@/lib/utils";
import { distance_vector, scaleDepth, type Coordinates, type Vector3D } from "@/data/models/coordinates";
import type { VectorPose } from "@/data/models/landmark";

const STEP = 0.01
const landmarksStore = useLandmarksStore()
const imagesStore = useImagesStore()

function computeDistance(profile : Profile): number {
    if(!profile.landmarks.isFull()){
        return 0
    }
    let intervals : VectorPose[] = []
    let before : VectorPose = profile.landmarks.first!.pose
    profile.sub_landmarks!.forEach((landmark : Coordinates) => {
        let current : VectorPose = {
            x: landmark.x,
            y: landmark.y,
            depth: imagesStore.getDepthData(landmark, imagesStore.index),
            layer: imagesStore.getLayerData(landmark, imagesStore.index)
        }
        intervals.push(distance_vector(before, current))
        before = current
    })
    let last : VectorPose = profile.landmarks.last!.pose
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
    landmarksStore.adjustFactor = math.number(payload) / computeDistance(profile) * math.number(Scale[landmarksStore.scale as keyof typeof Scale])
}

function resetFactor() {
    landmarksStore.adjustFactor = 1
}

function scaleVector(vector : VectorPose) : Vector3D{
    return scaleDepth(vector, imagesStore.selectedImage.pixelRatio, imagesStore.selectedImage.depthMin, imagesStore.selectedImage.depthMax)
}
</script>

<template>
    <div class="w-full">
        <div class="flex flex-row ">
            <h2 class="flex items-center px-7 text-lg font-semibold tracking-tight">
                Measures
            </h2>
            <div class="w-full h-full flex justify-end space-x-2">
                <Select v-model="landmarksStore.scale">
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
            <div v-for="(profile) in landmarksStore.profiles" class="flex flex-col min-w-full w-fit h-10">
                <div class="flex flex-row items-center justify-between space-x-3 px-3 w-full h-full">
                    <div class="flex flex-row items-center justify-start space-x-3">
                        <Label class="flex whitespace-nowrap w-auto">{{ profile.label }}</Label>
                    </div>
                    <div class="flex flex-row items-center justify-end space-x-3">
                        <Label class="flex whitespace-nowrap w-auto">Steps</Label>
                        <Input type="number" min="0" step="1" max="100" :model-value="profile.nbr_steps" class="flex w-max"
                            @update:model-value="profile.nbr_steps = math.number($event)"/>
                        <Label v-show="!profile.edit_profile" class="flex whitespace-nowrap w-auto"
                            @dblclick="profile.edit_profile = true">{{ math.round(((profile != null) ?
                                computeDistance(profile as Profile) * landmarksStore.adjustFactor /
                                math.number(Scale[landmarksStore.scale as keyof typeof Scale]) : 0), 5) }} {{
                                landmarksStore.scale }}</Label>
                        <Input v-show="profile.edit_profile" type="number" :min="0" :step="STEP"
                            :model-value="(profile.sub_landmarks) ? computeDistance(profile as Profile) * landmarksStore.adjustFactor / math.number(Scale[landmarksStore.scale as keyof typeof Scale]) : 0"
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