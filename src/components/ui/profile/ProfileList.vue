<script setup lang="ts">
import { useImagesStore } from "@/lib/stores";

import { ProfileIteration } from ".";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storeToRefs } from "pinia";
import { Profile } from "@/data/models/profile";
import { computed } from "vue";

import { Scatter } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LinearScale, LineElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, LinearScale, LinearScale)


const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)

const chartData = computed(() => {
    const graph = selectedImage.value.store.selectedProfile?.graph ?? []

    return {
        datasets: [
            {
                label: "",
                data: graph,
                backgroundColor: 'rgb(255, 255, 255)',
                showLine: true,
                borderWidth: 1,
                borderColor: 'rgb(0,0,0)',
                radius: 0,
            },
        ],
    }
})

const chartOptions = computed(() => {
    console.log("computing options")
    const graph = selectedImage.value.store.selectedProfile?.graph ?? []
    
    const xValues = graph.map((point) => point.x)
    const yValues = graph.map((point) => point.y)
    console.log(yValues)
    const minX = xValues.length > 0 ? Math.min(...xValues) : 0
    const maxX = xValues.length > 0 ? Math.max(...xValues) : 1
    const minY = yValues.length > 0 ? Math.min(...yValues) : 0
    const maxY = yValues.length > 0 ? Math.max(...yValues) : 1
    console.log(minY)
    console.log(maxY)
    const xRange = Math.max(maxX - minX, 0.001)
    const yRange = Math.max(maxY - minY, 0.001)
    console.log(maxY - minY)
    console.log(yRange)
    const xPadding = Math.max(xRange * 0.05, 0.05)
    const yPadding = Math.max(yRange * 0.05, 0.05)
    const displayedXRange = xRange + 2 * xPadding
    const displayedYRange = yRange + 2 * yPadding
    console.log("computing options : (" + xRange + ", " + yRange + ") : "+ (xRange / yRange))
    return {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: xRange / yRange,
        type: "line",
        scales: {
            x: {
                min: minX,
                max: maxX,
            },
            y: {
                min: minY,
                max: maxY,
            },
        },
        legend: {
            labels: {
                fontSize: 0
            },
            display: false
         },
         tooltips: {
            callbacks: {
                label: function(tooltipItem : any) {
                    console.log(tooltipItem)
                    return tooltipItem.yLabel;
                }
            }
        }
    }
})


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
        <Scatter v-if="selectedImage.store.selectedProfile != null && selectedImage.store.selectedProfile.landmarks.isFull()"
                    id="profile" 
                    :data="chartData"
                    :options="chartOptions"/>
        <div
            v-for="(map) in selectedImage.store.profiles.map((profileMap, indexMap) => [profileMap, indexMap] as [Profile, number]).filter((map) => map[1] != selectedImage.store.selectedProfileIndex)">
            <ProfileIteration v-if="map[1] != selectedImage.store.selectedProfileIndex" :profile="(map[0] as Profile)"
                :index="map[1]" :showLandmarks="false"
                @dblclick="(e: MouseEvent) => { e.preventDefault(); selectedImage.store.selectedProfileIndex = map[1] }" />
        </div>
    </div>
</template>