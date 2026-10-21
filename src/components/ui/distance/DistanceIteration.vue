<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { Landmark } from "@/data/models/landmark";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from '@/components/ui/input'
import draggable from "vuedraggable"

import { ref, useTemplateRef } from "vue";
import * as math from "mathjs"


import { PhX, PhEraser, PhEye, PhEyeClosed } from "@phosphor-icons/vue";
import { Distance } from "@/data/models/distance";
import { storeToRefs } from "pinia";
import SelectScale from "../select-scale/SelectScale.vue";
import LandmarkIteration from "../landmark/LandmarkIteration.vue";
import { computeDistance, ROUNDING, Scale } from "@/lib/utils";

const props = defineProps({
    distance: {
        type: Distance,
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

const imagesStore = useImagesStore()

const { selectedImage } = storeToRefs(imagesStore)

const scrollSnapType = ref<boolean>(true)
const input = useTemplateRef('input')

function changeColor(event: Event) {
    let target = event.currentTarget as HTMLButtonElement;
    if (target == null) {
        return;
    }
    props.distance.setColorHEX(target.value)

    props.distance.landmarks.forEach(landmark => landmark.setColorHEX(target.value))
}

function removeLandmark(id: string) {
    props.distance.remove(id)
    if (props.distance.landmarks.length == 0) {
        selectedImage.value.store.removeDistance(props.index)
    }
}

// Reorder the landmarks live while dragging. Sortable's own DOM move is cancelled
// (return false) so Vue is the only one moving the elements.
function onMoveLandmark(evt: any) {
    const landmarks = props.distance.landmarks
    const from = landmarks.indexOf(evt.draggedContext.element)
    const to = evt.draggedContext.futureIndex
    if (from !== -1 && from !== to && to < landmarks.length) {
        landmarks.splice(to, 0, landmarks.splice(from, 1)[0]!)
    }
    return false
}

// On drop, vuedraggable puts the dragged element back at its original DOM index
// (its model update is ignored, the list is already in order): put it back at
// evt.newIndex, where Vue had rendered it.
function onEndDrag(evt: any) {
    scrollSnapType.value = true
    evt.item.remove()
    evt.from.insertBefore(evt.item, evt.from.children[evt.newIndex] ?? null)
}

function changeLabelDistance(payload: string | number) {
    props.distance.label = payload.toString()
}

function deleteDistance() {
    selectedImage.value.store.removeDistance(props.index)
}

function showInput(e : MouseEvent) {
    e.preventDefault()
    if(props.index != selectedImage.value.store.selectedDistanceIndex){
        selectedImage.value.store.selectedDistanceIndex = props.index
        return
    }
    props.distance.edit_label = true

    if (input.value != null) {
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
    <div class="flex flex-col space-y-3">
        <div class="flex pr-2 border-transparent border-2">
            <div class="flex grow row justify-between items-center pr-3">
                <div class="flex grow row w-full justify-start items-center space-x-3 mr-3">
                    <input type="color"
                        class="h-8 w-8 block bg-white border border-gray-950 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-slate-900 dark:border-gray-300"
                        id="hs-color-input" :value="props.distance.getColorHEX()" title="Choose your color"
                        @change="changeColor($event)">
                        <Label v-show="!props.distance.edit_label"
                            class="flex whitespace-nowrap w-36 font-normal text-lg" @dblclick="showInput">
                            {{ props.distance.label }}
                        </Label>
                        <Input v-show="props.distance.edit_label" ref="input" type="text"
                            :model-value="props.distance.label" class="flex h-auto w-full px-0"
                            @focusout="props.distance.edit_label = false"
                            @keyup.enter="props.distance.edit_label = false"
                            @update:model-value="changeLabelDistance($event)" />
                </div>
                <div class="flex row justify-end space-x-3">
                    <Button class="relative w-6 h-6 p-0" v-show="props.distance.show" variant="secondary"
                        @click="props.distance.show = false">
                        <PhEye class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" v-show="!props.distance.show" variant="secondary"
                        @click="props.distance.show = true">
                        <PhEyeClosed class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" variant="secondary" @click="props.distance.reset()">
                        <PhEraser class="relative w-4 h-4 p-0" />
                    </Button>
                    <Button class="relative w-6 h-6 p-0" variant="destructive" @click="deleteDistance()">
                        <PhX class="relative w-4 h-4 p-0" />
                    </Button>
                </div>
            </div>
        </div>
        <div v-if="showLandmarks" ref="landmarksScroll" class="overflow-auto min-h-16 max-h-96 w-full border"
            :class="{ 'scroll-snap-type': scrollSnapType }">
            <draggable ref="landmarksElements" :model-value="distance.landmarks" :move="onMoveLandmark"
                :group="distance.label + '_landmarks_' + index" item-key="id" :force-fallback="true"
                :scroll="true" :bubbleScroll="true" :handle="'.handle'" class="relative w-fit min-w-full"
                @start="scrollSnapType = false" @end="onEndDrag">
                <template #item="{ element: landmark }: { element: Landmark }">
                    <LandmarkIteration :landmark="landmark" :color-picker="false" :visibility-toggle="false"
                        @remove="removeLandmark" />
                </template>
            </draggable>
        </div>
        <div v-if="showLandmarks" class="flex row justify-between space-x-3">
            <SelectScale />
            <div class="flex row space-x-1">
                <Label class="flex whitespace-nowrap w-auto items-center">Distance :</Label>
                <Label class="flex whitespace-nowrap w-auto items-center">
                    {{ math.round(((distance.distance) ?
                        computeDistance(distance.distance) * selectedImage.store.adjustFactor /
                        math.number(Scale[selectedImage.store.scale as keyof typeof Scale]) : 0), ROUNDING) }}
                    {{ selectedImage.store.scale }}
                </Label>
            </div>
        </div>
    </div>
</template>