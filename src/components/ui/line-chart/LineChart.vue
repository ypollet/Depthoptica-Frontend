<script setup lang="ts">
import { type Coordinates } from "@/data/models/coordinates"
import { nextTick, onMounted, useTemplateRef, watch } from 'vue'

import * as d3 from 'd3'
import { Profile } from "@/data/models/profile"
import Label from "../label/Label.vue"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RepositoryFactory } from "@/data/repositories/repository_factory"
import { repositorySettings } from "@/config/appSettings"
import { useImagesStore } from "@/lib/stores"
import type { AcceptableValue } from "reka-ui"
import { Scale } from "@/lib/utils";
import * as math from "mathjs"

import saveAs from 'file-saver';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuLabel } from "../context-menu"
import { storeToRefs } from "pinia"
import SelectScale from "../select-scale/SelectScale.vue"
import Button from "../button/Button.vue"

const props = defineProps({
  profile: {
    type: Profile,
    required: true
  },
  edgeThresholds: {
    type: Array<string>
  }
})

const repository = RepositoryFactory.get(repositorySettings.type)

const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)

const VERTICAL_SPACING = 20
const HORIZONTAL_SPACING = 30
const GRID_OPACITY = 0.2

const container = useTemplateRef("container")
const svg = useTemplateRef("svg")

function drawChart() {
  let data = props.profile.subLandmarks
  if (data.length == 0 || container.value == null) {
    return;
  }
  const svgEl = d3.select(svg.value)
  svgEl.selectAll('*').remove()

  let scaledData = data.map((point) => {
    return {
      x: point.x / math.number(Scale[selectedImage.value.store.scale as keyof typeof Scale]),
      y: point.y / math.number(Scale[selectedImage.value.store.scale as keyof typeof Scale])
    }
  })

  const xValues = scaledData.map((point) => point.x)
  const yValues = scaledData.map((point) => point.y)
  const minX = xValues.length > 0 ? Math.min(...xValues) : 0
  const maxX = xValues.length > 0 ? Math.max(...xValues) : 1
  const minY = yValues.length > 0 ? Math.min(...yValues) : 0
  const maxY = yValues.length > 0 ? Math.max(...yValues) : 1
  const xRange = Math.max(maxX - minX, 0.001)
  const yRange = Math.max(maxY - minY, 0.001)

  const margin = { left: 40, top: 20, right: 15, bottom: 7 }

  // size of the grapĥ with the right aspect ratio
  const width = Math.floor(container.value!.clientWidth) - margin.left - margin.right
  const height = width / xRange * yRange

  const paddedWidth = width + margin.left + margin.right
  const paddedHeight = height + margin.bottom + margin.top

  svgEl.attr("width", paddedWidth)
  svgEl.attr("height", paddedHeight)

  const horizontal_ticks = Math.floor(width / HORIZONTAL_SPACING)
  const vertical_ticks = Math.floor(height / VERTICAL_SPACING)

  // Create a rect on top of the svg area: this rectangle recovers mouse position
  svgEl
    .append('rect')
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr('width', paddedWidth)
    .attr('height', paddedHeight)
    .on('mouseover', mouseover)
    .on('mousemove', mousemove)
    .on('mouseout', mouseout);


  const xScale = d3.scaleLinear()
    .range([margin.left, paddedWidth - margin.right])
    .domain(
      d3.extent(scaledData, function (d) {
        return d.x;
      }) as [number, number]
    )

  svgEl.append('g')
    .call(d3.axisBottom(xScale).ticks(horizontal_ticks, "~s"))
    .call(g => g.selectAll(".tick line").clone().lower()
      .attr("stroke-opacity", GRID_OPACITY)
      .attr("y1", -height + margin.top + margin.bottom))
    .attr('transform', `translate(0,${height - margin.bottom})`)



  const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(
      d3.extent(scaledData, function (d) {
        return d.y;
      }) as [number, number]
    )


  svgEl.append('g')
    .call(d3.axisLeft(yScale).ticks(vertical_ticks, "~s"))
    .call(g => g.selectAll(".tick line").clone().lower()
      .attr("stroke-opacity", GRID_OPACITY)
      .attr("x1", width))
    .attr('transform', `translate(${margin.left},0)`)


  const line = d3.line<Coordinates>()
    .x(function (d) {
      return xScale(d.x);
    })
    .y(function (d) {
      return yScale(d.y);
    });

  // Create the circle that travels along the curve of chart
  var focus = svgEl
    .append('g')
    .append('circle')
    .style("fill", "none")
    .attr("stroke", "currentColor")
    .attr('r', 8.5)
    .style("opacity", 0)

  // Add the line
  svgEl.append("path")
    .datum(scaledData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  function mouseover() {
    focus.style("opacity", 1)
  }

  function mousemove(event: MouseEvent) {
    // recover coordinate we need
    var x0 = xScale.invert(d3.pointer(event)[0]);
    var i = d3.bisect(scaledData.map(d => d.x), x0, 0, scaledData.length - 1);
    let selectedData = scaledData[i]!
    props.profile.hover_profile = selectedData.x / scaledData[scaledData.length - 1]!.x
    focus
      .attr("cx", xScale(selectedData.x))
      .attr("cy", yScale(selectedData.y))
  }
  function mouseout() {
    focus.style("opacity", 0)
    props.profile.hover_profile = undefined
  }

  return svgEl.node()
}

function exportSVG() {
  if (svg.value != null) {
    // Clone the SVG element to avoid modifying the displayed chart
    const svgClone = svg.value.cloneNode(true) as SVGSVGElement

    // Add a white background rectangle as the first element
    const bgRect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    bgRect.setAttribute("width", "100%")
    bgRect.setAttribute("height", "100%")
    bgRect.setAttribute("fill", "white")
    svgClone.insertBefore(bgRect, svgClone.firstChild)

    let header = '<?xml version="1.0" encoding="UTF-8"?>'
    var svgData = svgClone.outerHTML;
    let blob: Blob = new Blob([header, svgData], { type: 'image/svg+xml;charset=utf-8;' })
    saveAs(blob, imagesStore.objectPath + "-" + props.profile.label.split(' ').join('_') + ".svg")
  }
}

function exportJPG() {
  if (svg.value != null) {
    let horizontal = svg.value.clientWidth >= svg.value.clientHeight

    let ratio = (horizontal) ? svg.value.clientHeight / svg.value.clientWidth : svg.value.clientWidth / svg.value.clientHeight


    let long_side = 1000
    let short_side = long_side * ratio

    let width = (horizontal) ? long_side : short_side
    let height = (horizontal) ? short_side : long_side
    let canvas = new OffscreenCanvas(width, height)

    let ratio_img = (horizontal) ? long_side / svg.value.clientWidth : long_side / svg.value.clientHeight

    let image = new Image()
    let xml = new XMLSerializer().serializeToString(svg.value);
    image.src = "data:image/svg+xml;base64," + btoa(xml)
    image.onload = () => {
      let ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(ratio_img, ratio_img)
      ctx.drawImage(image, 0, 0)
      canvas.convertToBlob({ type: "image/jpeg", quality: 1 }).then((blob) => {
        saveAs(blob, imagesStore.objectPath + "-" + props.profile.label.split(' ').join('_') + ".jpg")
      })
    }
  }
}


onMounted(() => {
  const resizeObserver = new ResizeObserver(function () {
    drawChart()
  });
  if (container.value) {
    resizeObserver.observe(container.value);
  }
  drawChart()
})
watch(() => props.profile.subLandmarks, drawChart)
watch(() => selectedImage.value.store.scale, drawChart)

<<<<<<< HEAD
function updateEdgeThreshold(payload: AcceptableValue) {
  console.log(payload)
  if (payload != null && props.profile.edgeThreshold != payload ) {
    props.profile.edgeThreshold = payload?.toString()
    repository.computeProfile(imagesStore.objectPath, imagesStore.selectedImage.name, props.profile).then((profileLandmarks) => {
=======
function updateEdgeThreshold(payload: string) {
  if (props.profile.edgeThreshold != payload) {
    props.profile.edgeThreshold = payload
    repository.computeProfile(imagesStore.objectPath, selectedImage.value.name, props.profile).then((profileLandmarks) => {
>>>>>>> 34c211b (Feat : updated distance/profile layout)
      if (profileLandmarks == undefined) {
        return;
      }
      props.profile.landmarks.first!.pose = profileLandmarks.start
      props.profile.subLandmarks = profileLandmarks.subLandmarks
      props.profile.landmarks.last!.pose = profileLandmarks.end
    })
  }

}
</script>

<template>
  <div>
    <div class="flex flex-row space-x-2 justify-between ">
      <div class="flex row space-x-1">
        <Label class="content-center">Edges</Label>
        <Select class="w-fit" :model-value="props.profile.edgeThreshold" @update:model-value="updateEdgeThreshold">
          <SelectTrigger class="w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem class="h-8" value="none">
                <div class="flex flex-row space-x-2">
                  <span class="content-center">none</span>
                </div>

              </SelectItem>
              <SelectItem class="h-8" v-for="threshold in props.edgeThresholds" :value="threshold">
                <div class="flex flex-row space-x-2">
                  <span class="content-center">{{ threshold }}</span>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <SelectScale />
    </div>
    <ContextMenu>
      <ContextMenuTrigger>
        <div ref="container" class="flex grow flex-col w-full h-auto">
          <svg ref="svg"></svg>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>
          Export
        </ContextMenuLabel>
        <ContextMenuItem inset @select="exportSVG">
          SVG
        </ContextMenuItem>
        <ContextMenuItem inset @select="exportJPG">
          JPG
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    <div class="flex row space-x-1 items-center text-gray-500">
      <Label>! Units converted to their</Label>
      <Button class="p-0" variant="link">
        <a target="_blank" rel="noopener noreferrer" class="text-gray-500 italic"
          href="https://en.wikipedia.org/wiki/Metric_prefix#List_of_SI_prefixes">SI Prefix</a>
      </Button>
    </div>

  </div>
</template>
