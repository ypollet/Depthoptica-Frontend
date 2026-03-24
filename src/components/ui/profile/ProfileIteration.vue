<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { Landmark } from "@/data/models/landmark";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";


import { X, Eye, EyeOff } from "lucide-vue-next";
import { Profile } from "@/data/models/profile";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import * as math from "mathjs"
import { computeDistance, ROUNDING, Scale } from "@/lib/utils";
import type { Coordinates } from "@/data/models/coordinates";
import LineChart from "../line-chart/LineChart.vue";

const props = defineProps({
    profile: {
        type: Profile,
        required: true
    },
    index: {
        type: Number,
        required: true
    },
    showLandmarks: {
        type: Boolean,
        default: true
    }
})

const STEP = 0.01

const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)

const input = ref<InstanceType<typeof Input> | null>(null)



function changeColor(event: Event) {
    let target = event.currentTarget as HTMLButtonElement;
    if (target == null) {
        return;
    }
    props.profile.setColorHEX(target.value)

    props.profile.landmarks.setColorHEX(target.value)
}

function removeFirst(id: string) {
    props.profile.popFirst()
    if (props.profile.landmarks.length == 0) {
        selectedImage.value.store.profiles.splice(props.index, 1)
    }
}

function removeLast(id: string) {
    props.profile.popLast()
    if (props.profile.landmarks.length == 0) {
        selectedImage.value.store.profiles.splice(props.index, 1)
    }
}

function changeLabelLandmark(payload: string | number, landmark: Landmark) {
    landmark.setLabel(payload.toString())
}

function changeLabelProfile(payload: string | number) {
    props.profile.label = payload.toString()
}

function deleteProfile() {
    if (props.index <= selectedImage.value.store.selectedProfileIndex) {
        selectedImage.value.store.selectedProfileIndex--;
    }
    selectedImage.value.store.profiles.splice(props.index, 1)
}

function showInput() {
    props.profile.edit_label = props.showLandmarks

    if (props.profile.edit_label && input.value != null) {
        input.value.focus()
    }
}

function changeScale(payload: string | number, profile: Profile) {
    selectedImage.value.store.adjustFactor = math.number(payload) / computeDistance(profile.length!) * math.number(Scale[selectedImage.value.store.scale as keyof typeof Scale])
}


/*
function scaleVector(pose : Pose){
    if(selectedImage.value.pixelRatio != null && selectedImage.value.depthMin != null && selectedImage.value.depthMax != null){
         return scaleDepthRatio(pose, selectedImage.value.pixelRatio, selectedImage.value.depthMin, selectedImage.value.depthMax)
    }
    return {x : pose.x, y: pose.y, z:0}
}
*/

</script>

<template>
    <div class="flex flex-col space-y-2">
        <LineChart v-if="showLandmarks && props.profile.landmarks.isFull()" id="profile" :profile="props.profile"
            :edgeThresholds="selectedImage.edgeThresholds" />
        <div v-if="showLandmarks" class="flex row justify-between space-x-2">
            <div class="flex row space-x-1">
                <Label class="flex whitespace-nowrap w-auto items-center">Length :</Label>
                <Label class="flex whitespace-nowrap w-auto items-center">
                    {{ math.round(((profile.length) ?
                        computeDistance(profile.length) * selectedImage.store.adjustFactor /
                        math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0), ROUNDING) }} {{
                        selectedImage.store.scale }}
                </Label>
                <!--
                <Input v-show="profile.edit_profile" type="number" :min="0" :step="STEP"
                    :model-value="(profile.length) ? computeDistance(profile.length) * selectedImage.store.adjustFactor / math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0"
                    class="flex h-auto w-auto px-0" @focusout="profile.edit_profile = false"
                    @keyup.enter="profile.edit_profile = false"
                    @update:model-value="changeScale($event, profile as Profile)" />
                -->
            </div>
            <div class="flex row space-x-1">
                <Label class="flex whitespace-nowrap w-auto items-center">Distance :</Label>
                <Label class="flex whitespace-nowrap w-auto items-center">
                    {{ math.round(((profile.distance) ?
                        computeDistance(profile.distance) * selectedImage.store.adjustFactor /
                        math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0), ROUNDING) }}
                    {{ selectedImage.store.scale }}
                </Label>
                <!--
                <Input v-show="profile.edit_profile" type="number" :min="0" :step="STEP"
                    :model-value="(profile.distance) ? computeDistance(profile.distance) * selectedImage.store.adjustFactor / math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0"
                    class="flex h-auto w-auto px-0" @focusout="profile.edit_profile = false"
                    @keyup.enter="profile.edit_profile = false"
                    @update:model-value="changeScale($event, profile as Profile)" />
                -->
            </div>
        </div>
        <div class="flex pr-2 border-transparent border-2">
            <div class="flex grow row justify-between items-center pr-3 py-2">
                <div class="flex grow row w-full justify-start items-center space-x-3 mr-3">
                    <input type="color"
                        class="h-8 w-8 block bg-white border border-gray-950 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-300"
                        id="hs-color-input" :value="props.profile.getColorHEX()" title="Choose your color"
                        @change="changeColor($event)">
                        <Label v-show="!props.profile.edit_label"
                            class="flex whitespace-nowrap w-36 font-normal text-lg" @dblclick="showInput()">{{
                                props.profile.label }}
                        </Label>
                        <Input v-show="props.profile.edit_label" ref="input" type="text"
                            :model-value="props.profile.label" class="flex h-auto w-full px-0"
                            @focusout="props.profile.edit_label = false" @keyup.enter="props.profile.edit_label = false"
                            @update:model-value="changeLabelProfile($event)" />
                </div>
                <div class="flex row justify-end space-x-3">
                    <Button class="relative w-6 h-6 p-0" v-show="props.profile.show" variant="secondary"
                        @click="props.profile.show = false">
                        <Eye class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" v-show="!props.profile.show" variant="secondary"
                        @click="props.profile.show = true">
                        <EyeOff class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" variant="destructive" @click="deleteProfile()">
                        <X class="relative w-4 h-4 p-0" />
                    </Button>
                </div>
            </div>
        </div>

        <div v-if="showLandmarks" class="overflow-auto w-full border">
            <div v-if="!profile.landmarks.isEmpty()" class="border flex grow p-2">
                <div class="h-12 flex grow row justify-between items-center font-normal px-3 py-2">
                    <div class="flex items-center justify-start w-full space-x-3 py-3 mr-3">
                        <Label v-show="!profile.landmarks.first!.getEdit()" class="whitespace-nowrap"
                            @dblclick.stop="profile.landmarks.first!.setEdit(true)">{{ profile.landmarks.first!.label }}
                        </Label>
                        <Input v-show="profile.landmarks.first!.getEdit()" @dblclick.stop="" type="text"
                            :model-value="profile.landmarks.first!.label" class="h-auto"
                            @focusout="profile.landmarks.first!.setEdit(false)"
                            @keyup.enter="profile.landmarks.first!.setEdit(false)"
                            @update:model-value="changeLabelLandmark($event, profile.landmarks.first!)" />
                    </div>
                    <div class="flex items-center h-full w-auto justify-end space-x-3 pr-3">
                        <Label class="whitespace-nowrap">{{ profile.landmarks.first!.show_pose }}</Label>
                    </div>
                    <div class="flex items-center justify-end space-x-3">
                        <Button class="relative w-6 h-6 p-0" variant="destructive"
                            @click="removeFirst(profile.landmarks.first!.id)">
                            <X class="relative w-4 h-4 p-0" />
                        </Button>
                    </div>
                </div>
            </div>
            <div v-if="profile.landmarks.isFull()" class="border flex grow p-2">
                <div class="h-12 flex grow row justify-between items-center font-normal px-3 py-2">
                    <div class="flex items-center justify-start w-full space-x-3 py-3 mr-3">
                        <Label v-show="!profile.landmarks.last!.getEdit()" class="whitespace-nowrap"
                            @dblclick.stop="profile.landmarks.last!.setEdit(true)">{{ profile.landmarks.last!.label
                            }}</Label>
                        <Input v-show="profile.landmarks.last!.getEdit()" @dblclick.stop="" type="text"
                            :model-value="profile.landmarks.last!.label" class="h-auto"
                            @focusout="profile.landmarks.last!.setEdit(false)"
                            @keyup.enter="profile.landmarks.last!.setEdit(false)"
                            @update:model-value="changeLabelLandmark($event, profile.landmarks.last!)" />
                    </div>
                    <div class="flex items-center h-full w-auto justify-end space-x-3 pr-3">
                        <Label class="whitespace-nowrap">{{ profile.landmarks.last!.show_pose }}</Label>
                    </div>
                    <div class="flex items-center justify-end space-x-3">
                        <Button class="relative w-6 h-6 p-0" variant="destructive"
                            @click="removeLast(profile.landmarks.last!.id)">
                            <X class="relative w-4 h-4 p-0" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>