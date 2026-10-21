<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'


import { PhX, PhEye, PhEyeClosed, PhArrowsDownUp } from "@phosphor-icons/vue";
import { Profile } from "@/data/models/profile";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import * as math from "mathjs"
import { computeDistance, ROUNDING, Scale } from "@/lib/utils";
import LineChart from "../line-chart/LineChart.vue";
import LandmarkIteration from "../landmark/LandmarkIteration.vue";

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
        selectedImage.value.store.removeProfile(props.index)
    }
}

function removeLast(id: string) {
    props.profile.popLast()
    if (props.profile.landmarks.length == 0) {
        selectedImage.value.store.removeProfile(props.index)
    }
}

function changeLabelProfile(payload: string | number) {
    props.profile.label = payload.toString()
}

function deleteProfile() {
    selectedImage.value.store.removeProfile(props.index)
}

function showInput() {
    props.profile.edit_label = props.showLandmarks

    if (props.profile.edit_label && input.value != null) {
        input.value.focus()
    }
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
                    <Button class="relative w-6 h-6 p-0" variant="secondary"
                        v-show="props.profile.landmarks.isFull()"
                        @click="props.profile.permute();imagesStore.selectedImage.store.selectedProfileIndex = props.index">
                        <PhArrowsDownUp class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" v-show="props.profile.show" variant="secondary"
                        @click="props.profile.show = false">
                        <PhEye class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" v-show="!props.profile.show" variant="secondary"
                        @click="props.profile.show = true">
                        <PhEyeClosed class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" variant="destructive" @click="deleteProfile()">
                        <PhX class="relative w-4 h-4 p-0" />
                    </Button>
                </div>
            </div>
        </div>
        <LineChart v-if="showLandmarks && props.profile.landmarks.isFull()" id="profile" :profile="props.profile"
            :edgeThresholds="selectedImage.edgeThresholds" />
        <div v-if="showLandmarks" class="flex row justify-between space-x-2">
            <div class="flex row space-x-1">
                <Label class="flex whitespace-nowrap w-auto items-center">Length :</Label>
                <Label class="inline-flex flex-wrap w-auto items-start content-start gap-x-2 gap-y-1">
                    <div v-for="length, index in profile.length" class="min-w-20 text-right tabular-nums" @mouseover="profile.hover_segment = index" @mouseout="profile.hover_segment = undefined">{{ math.round(((length) ?
                        computeDistance(length) * selectedImage.store.adjustFactor /
                        math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0), ROUNDING) }}{{
                        selectedImage.store.scale }}</div>
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
        

        <div v-if="showLandmarks" class="overflow-auto w-full border">
            <LandmarkIteration v-if="!profile.landmarks.isEmpty()" :landmark="profile.landmarks.first!"
                :handle="false" :color-picker="false" :visibility-toggle="false" @remove="removeFirst" />
            <LandmarkIteration v-if="profile.landmarks.isFull()" :landmark="profile.landmarks.last!"
                :handle="false" :color-picker="false" :visibility-toggle="false" @remove="removeLast" />
        </div>
    </div>
</template>