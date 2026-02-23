<script setup lang="ts">
import { type Coordinates } from "@/data/models/coordinates"
import { computed, onMounted, ref, useTemplateRef, watch } from 'vue'

import * as d3 from 'd3'
import { Profile } from "@/data/models/profile"
const props = defineProps({
  profile: {
    type: Profile,
    required: true
  },
})

const data : Array<Coordinates> = props.profile.sub_landmarks

const VERTICAL_SPACING = 20
const HORIZONTAL_SPACING = 30

const container = useTemplateRef("container")
const chartWidth = computed(() => {
  return container?.value?.clientWidth
})


const svg = useTemplateRef("svg")

const drawChart = () => {
  const xValues = data.map((point) => point.x)
  const yValues = data.map((point) => point.y)
  const minX = xValues.length > 0 ? Math.min(...xValues) : 0
  const maxX = xValues.length > 0 ? Math.max(...xValues) : 1
  const minY = yValues.length > 0 ? Math.min(...yValues) : 0
  const maxY = yValues.length > 0 ? Math.max(...yValues) : 1
  const xRange = Math.max(maxX - minX, 0.001)
  const yRange = Math.max(maxY - minY, 0.001)


  const margin = { left: 35, top: 20, right: 10, bottom: 7 }

  // size of the graĥ with the right aspect ratio
  const width = chartWidth.value! - margin.left - margin.right
  const height = width / xRange * yRange
  const svgEl = d3.select(svg.value)
  svgEl.selectAll('*').remove()

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
    .attr("stroke", "black")
    .attr('r', 8.5)
    .style("opacity", 0)

  // Add the line
  svgEl.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line)
    .on("mouseover", d => console.log(d));


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

  function mousemove(event : MouseEvent) {
    // recover coordinate we need
    var x0 = xScale.invert(d3.pointer(event)[0]);
    var i = d3.bisect(data.map(d => d.x), x0, 1);
    let selectedData = data[i]!
    props.profile.hover_profile = selectedData.x / data[data.length -1]!.x
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



onMounted(drawChart)
watch(() => data, drawChart)
</script>

<template>
  <div ref="container" class="w-full h-auto">
    <svg ref="svg"></svg>
  </div>
</template>
