<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { Distance } from "@/data/models/distance";

import { Separator } from '@/components/ui/separator'
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import * as math from "mathjs"
import { Scale } from "@/lib/utils";
import type { Pose } from "@/data/models/landmark";
import { storeToRefs } from "pinia";

const STEP = 0.01
const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)

function computeDistance(intervals: Pose[]): number {
    let dist = 0
    intervals.forEach((interval : Pose) => {
        let squared = math.map(Object.values(scaleVector(interval)), math.square)
        let sum = math.sum(squared)
        // can't be a Complex number
        dist += math.sqrt(sum) as number
    })
    return dist
}

function changeScale(payload: string | number, distance: Distance) {
    selectedImage.value.store.adjustFactor = math.number(payload) / computeDistance(distance.distance!) * math.number(Scale[selectedImage.value.store.scale as keyof typeof Scale])
}

function resetScale() {
    selectedImage.value.store.adjustFactor = 1
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
                <Select v-model="selectedImage.store.scale">
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
                <Button variant="secondary" @click="resetScale">
                    Reset Scale
                </Button>
            </div>
        </div>
        <div class="flex flex-col min-h-48 min-w-full w-fit border">
            <div v-for="(distance, index) in selectedImage.store.distances" class="flex flex-col min-w-full w-fit h-10">
                <div class="flex flex-row items-center justify-between space-x-3 px-3 w-full h-full">
                    <div class="flex flex-row items-center justify-start space-x-3">
                        <Label class="flex whitespace-nowrap w-auto">{{ distance.label }}</Label>
                    </div>
                    <div class="flex flex-row items-center justify-end space-x-3">
                        
                        <Label v-show="!distance.edit_distance" class="flex whitespace-nowrap w-auto"
                            @dblclick="distance.edit_distance = true">{{ math.round(((distance.distance) ?
                                computeDistance(distance.distance) * selectedImage.store.adjustFactor /
                                math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0), 5) }} {{
                                selectedImage.store.scale }}</Label>
                        <Input v-show="distance.edit_distance" type="number" :min="0" :step="STEP"
                            :model-value="(distance.distance) ? computeDistance(distance.distance) * selectedImage.store.adjustFactor / math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0"
                            class="flex h-auto w-auto px-0" @focusout="distance.edit_distance = false"
                            @keyup.enter="distance.edit_distance = false"
                            @update:model-value="changeScale($event, distance)" />
                    </div>
                </div>
                <Separator class="w-full" />
            </div>
        </div>
    </div>
</template>