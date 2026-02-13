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
import {  type Coords3D } from "@/data/models/coordinates";
import { storeToRefs } from "pinia";
import { RepositoryFactory } from "@/data/repositories/repository_factory";
import { repositorySettings } from "@/config/appSettings";

const repository = RepositoryFactory.get(repositorySettings.type)


const STEP = 0.01
const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)


function computeDistance(intervals: Coords3D[]): number {
    let dist = 0
    intervals.forEach((interval : Coords3D) => {
        let squared = math.map(Object.values(interval), math.square)
        let sum = math.sum(squared)
        // can't be a Complex number
        dist += math.sqrt(sum) as number
    })
    return dist
}

function changeScale(payload: string | number, profile: Profile) {
    selectedImage.value.store.adjustFactor = math.number(payload) / computeDistance(profile.distance!) * math.number(Scale[selectedImage.value.store.scale as keyof typeof Scale])
}

function resetFactor() {
    selectedImage.value.store.adjustFactor = 1
}

/*
function scaleVector(pose : Pose){
    /*
    if(selectedImage.value.pixelRatio != null && selectedImage.value.depthMin != null && selectedImage.value.depthMax != null){
         return scaleDepthRatio(pose, selectedImage.value.pixelRatio, selectedImage.value.depthMin, selectedImage.value.depthMax)
    }
         * /
    return {x : pose.x, y: pose.y, z:pose.depth}
}
*/
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
            <div v-for="(profile, index) in selectedImage.store.profiles" class="flex flex-col min-w-full w-fit h-10">
                <div class="flex flex-row items-center justify-between space-x-3 px-3 w-full h-full">
                    <div class="flex flex-row items-center justify-start space-x-3">
                        <Label class="flex whitespace-nowrap w-auto">{{ profile.label }}</Label>
                    </div>
                    <div class="flex flex-row items-center justify-end space-x-3">
                        <Label class="flex whitespace-nowrap w-auto">Steps</Label>
                        <Label v-show="!profile.edit_profile" class="flex whitespace-nowrap w-auto"
                            @dblclick="profile.edit_profile = true">{{ math.round(((profile.distance) ?
                                computeDistance(profile.distance) * selectedImage.store.adjustFactor /
                                math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0), 5) }} {{
                                selectedImage.store.scale }}</Label>
                        <Input v-show="profile.edit_profile" type="number" :min="0" :step="STEP"
                            :model-value="(profile.distance) ? computeDistance(profile.distance) * selectedImage.store.adjustFactor / math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0"
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