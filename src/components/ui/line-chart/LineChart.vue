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

const VERTICAL_SPACING = 20
const HORIZONTAL_SPACING = 30

const container = useTemplateRef("container")
const svg = useTemplateRef("svg")

function drawChart() {
  let data = props.profile.subLandmarks
  if (data.length == 0 || container.value == null) {
    return;
  }

  const svgEl = d3.select(svg.value)
  svgEl.selectAll('*').remove()


  const xValues = data.map((point) => point.x)
  const yValues = data.map((point) => point.y)
  const minX = xValues.length > 0 ? Math.min(...xValues) : 0
  const maxX = xValues.length > 0 ? Math.max(...xValues) : 1
  const minY = yValues.length > 0 ? Math.min(...yValues) : 0
  const maxY = yValues.length > 0 ? Math.max(...yValues) : 1
  const xRange = Math.max(maxX - minX, 0.001)
  const yRange = Math.max(maxY - minY, 0.001)


  const margin = { left: 35, top: 20, right: 15, bottom: 7 }

  // size of the grapĥ with the right aspect ratio
  const width = container.value!.clientWidth - margin.left - margin.right
  const height = width / xRange * yRange

  const paddedWidth = width + margin.left + margin.right
  const paddedHeight = height + margin.bottom + margin.top

  svgEl.attr("width", paddedWidth)
  svgEl.attr("height", paddedHeight)

  const horizontal_ticks = Math.floor(width / HORIZONTAL_SPACING)
  const vertical_ticks = Math.floor(height / VERTICAL_SPACING)


  const xScale = d3.scaleLinear()
    .range([margin.left, paddedWidth - margin.right])
    .domain(
      d3.extent(data, function (d) {
        return d.x;
      }) as [number, number]
    )

  svgEl.append('g')
    .call(d3.axisBottom(xScale).ticks(horizontal_ticks))
    .attr('transform', `translate(0,${height - margin.bottom})`)


  const yScale = d3.scaleLinear()
    .range([height - margin.bottom, margin.top])
    .domain(
      d3.extent(data, function (d) {
        return d.y;
      }) as [number, number]
    )


  svgEl.append('g')
    .call(d3.axisLeft(yScale).ticks(vertical_ticks))
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
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

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


  function mouseover() {
    focus.style("opacity", 1)
  }

  function mousemove(event: MouseEvent) {
    // recover coordinate we need
    var x0 = xScale.invert(d3.pointer(event)[0]);
    var i = d3.bisect(data.map(d => d.x), x0, 0, data.length - 1);
    let selectedData = data[i]!
    props.profile.hover_profile = selectedData.x / data[data.length - 1]!.x
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

function updateEdgeThreshold(payload: string) {
  if (props.profile.edgeThreshold != payload) {
    props.profile.edgeThreshold = payload
    repository.computeProfile(imagesStore.objectPath, imagesStore.selectedImage.name, props.profile).then((profileLandmarks) => {
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
  <div ref="container" class="flex grow flex-col w-full h-auto">
    <svg ref="svg"></svg>
    <div class="flex flex-row space-x-2 ">
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
  </div>

</template>
