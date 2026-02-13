<script setup lang="ts">
import { ref, onMounted, nextTick, type HTMLAttributes, watch,  useTemplateRef, computed } from 'vue'
import { cn, ZOOM_MAX, ZOOM_MIN, DOT_RADIUS, SPACE_TARGET } from '@/lib/utils'
import { type Coordinates } from "@/data/models/coordinates"
import { Landmark } from "@/data/models/landmark"
import { useImagesStore } from '@/lib/stores'
import { RepositoryFactory } from '@/data/repositories/repository_factory'
import { repositorySettings } from "@/config/appSettings"
import type { Ratio } from '@/data/models/stack_image'
import { Distance } from '@/data/models/distance'
import type Color from 'color'
import { storeToRefs } from 'pinia'
import { Profile, type ProfileLandmarks } from '@/data/models/profile'
import { max, min } from 'mathjs'


const repository = RepositoryFactory.get(repositorySettings.type)

const imagesStore = useImagesStore()

const { selectedImage } = storeToRefs(imagesStore)

const landmarks = computed(() => selectedImage.value.store.landmarks)

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

watch(selectedImage, () => {
      base_image.value.src = imagesStore.selectedImage.thumbnail || imagesStore.selectedImage.image
      base_image.value.alt = (imagesStore.selectedImage.thumbnail) ? 'Thumbnail of ' + imagesStore.selectedImage.name : imagesStore.selectedImage.name
      if (imagesStore.selectedImage.thumbnail) {
        base_image.value.onload = (ev: Event) => loaded()
      } else {
        base_image.value.onload = (ev: Event) => {
          if (imagesStore.selectedImage.camera.zoom <= 0) {
            screenFit()
          }
          update()
        }
      }
})

watch(
  selectedImage,
  () => {
    update()
    
  }, { deep: true }
)


const imageContainer = useTemplateRef('imageContainer')
const base_image = ref<HTMLImageElement>(new Image())

if (imagesStore.selectedImage.thumbnail) {
  base_image.value.onload = (ev: Event) => loaded()
} else {
  base_image.value.onload = (ev: Event) => {
    if (imagesStore.selectedImage.camera.zoom <= 0) {
      screenFit()
    }
    update()
  }
}
base_image.value.src = imagesStore.selectedImage.thumbnail || imagesStore.selectedImage.image
base_image.value.alt = (imagesStore.selectedImage.thumbnail) ? 'Thumbnail of ' + imagesStore.selectedImage.name : imagesStore.selectedImage.name

const canvas = useTemplateRef('canvas')



var full_image = new Image()
const shiftCanvas = ref<Coordinates>({ x: 0, y: 0 })
const dragging = ref<boolean>(false)
const landmarkDragged = ref<Landmark | null>(null)
const profileDragged = ref<Profile | null>(null)

const draggedPos = ref<Coordinates>({ x: -1, y: -1 })

const degrees_to_radians = (deg: number) => (deg * Math.PI) / 180.0; // Convert degrees to radians using the formula: radians = (degrees * Math.PI) / 180



onMounted(() => {
  const resizeObserver = new ResizeObserver(function () {
    if (imageContainer.value && canvas.value && base_image.value) {
      canvas.value.width = Math.floor(imageContainer.value.clientWidth)
      canvas.value.height = Math.floor(imageContainer.value.clientHeight)
      update()
    }

  });
  if (imageContainer.value) {
    resizeObserver.observe(imageContainer.value);
  }
})

function loaded() {
  nextTick(() => {
    if (imagesStore.selectedImage.camera.zoom <= 0) {
      screenFit()
    }
    let image_name = imagesStore.selectedImage.name
    setTimeout(() => {
      if (image_name == imagesStore.selectedImage.name) {
        nextTick(() => {
          // Just verifies we draw the right image
          if (base_image.value.alt.endsWith(image_name)) {
            full_image = new Image()
            full_image.src = imagesStore.selectedImage.image
            full_image.alt = image_name

            full_image.onload = (ev: Event) => {
              if (base_image.value.alt.endsWith(full_image.alt)) {
                base_image.value = full_image
                update()
              }
            }
          }
        })
      }
    }, 500);


    update()
  })
}

function drawImage() {
  if (canvas.value && base_image.value && base_image.value.complete && imagesStore.selectedImage.camera.zoom > 0) {
    let ratio = getRatio()

    let ctx = canvas.value.getContext("2d")!

    let camera = imagesStore.selectedImage.camera


    let zoomX = camera.zoom / ratio.width
    let zoomY = camera.zoom / ratio.height

    let radius = DOT_RADIUS / zoomX

    ctx.scale(zoomX, zoomY)

    ctx.translate(camera.offset.x * ratio.width, camera.offset.y * ratio.height)

    shiftCanvas.value = {
      x: Math.max(0, (canvas.value.width - base_image.value.naturalWidth * zoomX) / 2) / zoomX,
      y: Math.max(0, (canvas.value.height - base_image.value.naturalHeight * zoomY) / 2) / zoomY
    }
    ctx.drawImage(base_image.value, 0, 0, base_image.value.naturalWidth, base_image.value.naturalHeight,
      shiftCanvas.value.x, shiftCanvas.value.y, base_image.value.naturalWidth, base_image.value.naturalHeight)

    // Stroke the lines
    selectedImage.value.store.distances.forEach((distance) => {
      if (distance.landmarks.length == 0 || !distance.show) {
        return;
      }
      ctx.beginPath()
      let landmark = distance.landmarks[0]!
      let marker: Coordinates = (landmark.equals(landmarkDragged.value)) ? draggedPos.value : landmark.pos
      let shiftedMarker = {
        x: marker.x * ratio.width + shiftCanvas.value.x,
        y: marker.y * ratio.height + shiftCanvas.value.y
      }
      ctx.moveTo(shiftedMarker.x, shiftedMarker.y)
      for (let i = 1; i < distance.landmarks.length; i++) {
        landmark = distance.landmarks[i]!
        marker = (landmark.equals(landmarkDragged.value)) ? draggedPos.value : landmark.pos
        shiftedMarker = {
          x: marker.x * ratio.width + shiftCanvas.value.x,
          y: marker.y * ratio.height + shiftCanvas.value.y
        }
        ctx.lineTo(shiftedMarker.x, shiftedMarker.y)
      }
      ctx.strokeStyle = distance.getColorHEX();
      ctx.lineWidth = radius / 4;
      ctx.stroke()
      ctx.closePath()
    })


    selectedImage.value.store.profiles.forEach((profile) => {
      if (!profile.show || !profile.landmarks.isFull()) {
        return;
      }
      ctx.beginPath()
      let first = profile.landmarks.first!
      let marker: Coordinates = (first.equals(landmarkDragged.value)) ? draggedPos.value : first.pos
      let shiftedMarker = {
        x: marker.x * ratio.width + shiftCanvas.value.x,
        y: marker.y * ratio.height + shiftCanvas.value.y
      }
      ctx.moveTo(shiftedMarker.x, shiftedMarker.y)



      let last = profile.landmarks.last!
      marker = (last.equals(landmarkDragged.value)) ? draggedPos.value : last.pos
      shiftedMarker = {
        x: marker.x * ratio.width + shiftCanvas.value.x,
        y: marker.y * ratio.height + shiftCanvas.value.y
      }
      ctx.lineTo(shiftedMarker.x, shiftedMarker.y)

      ctx.strokeStyle = profile.getColorHEX();
      ctx.lineWidth = radius / 4;
      ctx.stroke()
      ctx.closePath()
    })

    selectedImage.value.store.landmarks.forEach((landmark) => {
      if (!landmark.show) {
        return
      }
      if (landmark.equals(landmarkDragged.value)) {
        let marker = draggedPos.value
        // update pos marker depending on image
        marker = {
          x: marker.x * ratio.width,
          y: marker.y * ratio.height
        }

        drawTarget(ctx, marker, radius)
      }
      else {
        drawMarker(ctx, landmark, radius)
      }

    })

    // Stroke the points
    selectedImage.value.store.distances.forEach((distance) => {
      if (!distance.show) {
        return;
      }

      // Stroke the markers
      distance.landmarks.forEach((landmark, id) => {
        if (landmark.equals(landmarkDragged.value)) {

          let marker = draggedPos.value
          // update pos marker depending on image
          marker = {
            x: marker.x * ratio.width,
            y: marker.y * ratio.height
          }

          drawTarget(ctx, marker, radius)
        }
        else {
          // Marker is defined and landmarkDragged not equals landmark
          drawMarker(ctx, landmark, radius)
        }
      });
    });


    selectedImage.value.store.profiles.forEach((profile, index) => {
      if (!profile.show) {
        return;
      }
      if (profile.landmarks.isEmpty()) {
        return;
      }
      let moving = false
      let first = profile.landmarks.first!
      let firstPos: Coordinates = first.pos
      if (first.equals(landmarkDragged.value)) {
        moving = true
        firstPos = draggedPos.value
        // update pos marker depending on image
        let marker = {
          x: firstPos.x * ratio.width,
          y: firstPos.y * ratio.height
        }

        drawTarget(ctx, marker, radius)
      }
      else {
        // Marker is defined and landmarkDragged not equals landmark
        drawMarker(ctx, first, radius)
      }

      if (profile.landmarks.isFull()) {
        let last = profile.landmarks.last!
        let lastPos: Coordinates = last.pos


        // stroke the last point

        if (last.equals(landmarkDragged.value)) {
          moving = true
          lastPos = draggedPos.value
          // update pos marker depending on image
          let marker = {
            x: lastPos.x * ratio.width,
            y: lastPos.y * ratio.height
          }

          drawTarget(ctx, marker, radius)
        }
        else {
          // Marker is defined and landmarkDragged not equals landmark
          drawMarker(ctx, last, radius)
        }
        let vector = {
            x: lastPos.x - firstPos.x,
            y: lastPos.y - firstPos.y
          }
        for (let i = 1; i <= 20; i++) {
          let marker = {
            x: firstPos.x + vector.x * i / (20 + 1),
            y: firstPos.y + vector.y * i / (20 + 1)
          }
          drawSubLandmark(ctx, marker, profile.color, radius, vector)
        }
      }

    });
  }
}

function drawTarget(ctx: CanvasRenderingContext2D, marker: Coordinates, radius: number) {
  const targetRadius = radius * 4
  ctx.beginPath();
  // draw circle
  ctx.arc((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y), targetRadius, 0, 2 * Math.PI);
  ctx.strokeStyle = 'white';
  ctx.lineWidth = radius / 2;
  ctx.stroke()
  ctx.closePath();

  // draw white lines diagonals
  ctx.beginPath();
  let start: Coordinates = posCircle(marker, 45, targetRadius, shiftCanvas.value);
  let end: Coordinates = posCircle(marker, 45, targetRadius * SPACE_TARGET, shiftCanvas.value);
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)

  start = posCircle(marker, 135, targetRadius, shiftCanvas.value);
  end = posCircle(marker, 135, targetRadius * SPACE_TARGET, shiftCanvas.value);
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)

  start = posCircle(marker, 225, targetRadius, shiftCanvas.value);
  end = posCircle(marker, 225, targetRadius * SPACE_TARGET, shiftCanvas.value);
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)

  start = posCircle(marker, 315, targetRadius, shiftCanvas.value);
  end = posCircle(marker, 315, targetRadius * SPACE_TARGET, shiftCanvas.value);
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(end.x, end.y)

  ctx.strokeStyle = 'white';
  ctx.lineWidth = radius / 3;

  ctx.stroke()
  ctx.closePath();

  // draw black lines lines horizontal and vertical
  ctx.beginPath();

  //horizontal
  ctx.moveTo((marker.x + shiftCanvas.value.x) + (targetRadius * (1 - SPACE_TARGET)), (marker.y + shiftCanvas.value.y))
  ctx.lineTo((marker.x + shiftCanvas.value.x) + (targetRadius * SPACE_TARGET), (marker.y + shiftCanvas.value.y))

  ctx.moveTo((marker.x + shiftCanvas.value.x) - (targetRadius * (1 - SPACE_TARGET)), (marker.y + shiftCanvas.value.y))
  ctx.lineTo((marker.x + shiftCanvas.value.x) - (targetRadius * SPACE_TARGET), (marker.y + shiftCanvas.value.y))

  //vertical
  ctx.moveTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) + (targetRadius * (1 - SPACE_TARGET)))
  ctx.lineTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) + (targetRadius * SPACE_TARGET))

  ctx.moveTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) - (targetRadius * (1 - SPACE_TARGET)))
  ctx.lineTo((marker.x + shiftCanvas.value.x), (marker.y + shiftCanvas.value.y) - (targetRadius * SPACE_TARGET))

  ctx.strokeStyle = 'black';
  ctx.lineWidth = radius / 3;
  ctx.stroke()
  ctx.closePath()
}

function drawMarker(ctx: CanvasRenderingContext2D, landmark: Landmark, radius: number) {
  let ratio = getRatio()
  let marker = {
    x: landmark.pos.x * ratio.width + shiftCanvas.value.x,
    y: landmark.pos.y * ratio.height + shiftCanvas.value.y
  }
  ctx.beginPath()
  ctx.arc(marker.x, marker.y, radius, 0, 2 * Math.PI);
  ctx.fillStyle = landmark.getColorHEX()
  ctx.fill();
  ctx.lineWidth = radius / 2
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.closePath()
}

function drawSubLandmark(ctx: CanvasRenderingContext2D, coord: Coordinates, color: Color, size: number, vector : Coordinates) {
  let ratio = getRatio()
  let marker = {
    x: coord.x * ratio.width + shiftCanvas.value.x,
    y: coord.y * ratio.height + shiftCanvas.value.y
  }
  let perpVector = getPerpOfLine(vector, size)
  let perpVectorScaled = {
    x: perpVector.x * ratio.width,
    y: perpVector.y * ratio.height
  }

  ctx.beginPath()
  ctx.moveTo(marker.x - perpVectorScaled.x, marker.y - perpVectorScaled.y)
  ctx.lineTo(marker.x + perpVectorScaled.x, marker.y + perpVectorScaled.y)
  ctx.strokeStyle = color.hex()
  ctx.lineWidth= size/4
  ctx.stroke();
  ctx.closePath()
}

function getPerpOfLine(vector : Coordinates, size : number) : Coordinates{
    const len = Math.sqrt(vector.x * vector.x + vector.y * vector.y);  // length of line
    return {
      x: -(vector.y * size/len),
      y: (vector.x * size/len)
    }; // return the perpendicular vector at a certain size
}

function posCircle(center: Coordinates, angle: number, radius: number, translate: Coordinates = { x: 0, y: 0 }): Coordinates {
  return { x: (center.x + radius * Math.cos(degrees_to_radians(angle))) + translate.x, y: (center.y + radius * Math.sin(degrees_to_radians(angle))) + translate.y };
}

function update() {
  if (canvas.value && base_image.value && base_image.value.complete) {
    // Clear canvas
    canvas.value.width = canvas.value.width

    // Check that offset values
    updateOffset(0, 0)

    //draw Image
    drawImage()
  }
}

function screenFit() {
  if (imageContainer.value && canvas.value) {
    canvas.value.width = Math.floor(imageContainer.value.clientWidth)
    canvas.value.height = Math.floor(imageContainer.value.clientHeight)

    imagesStore.selectedImage.camera.zoom = Math.min(imageContainer.value.clientWidth / imagesStore.selectedImage.size.width, imageContainer.value.clientHeight / imagesStore.selectedImage.size.height)
  }
}

function getRatio(): Ratio {
  if (base_image.value && base_image.value.complete) {
    return {
      width: base_image.value.naturalWidth / imagesStore.selectedImage.size.width,
      height: base_image.value.naturalHeight / imagesStore.selectedImage.size.height
    }
  }
  return {
    width: 0,
    height: 0
  }
}

function getPos(pos: Coordinates): Coordinates {
  let ratio = getRatio()
  const svgRect = canvas.value!.getBoundingClientRect();
  let camera = imagesStore.selectedImage.camera
  let x = ((pos.x - svgRect.left) / camera.zoom) - camera.offset.x - (shiftCanvas.value.x / ratio.width)
  let y = ((pos.y - svgRect.top) / camera.zoom) - camera.offset.y - (shiftCanvas.value.y / ratio.height)
  return { x: x, y: y }
}

function updateOffset(movementX: number, movementY: number) {
  let camera = imagesStore.selectedImage.camera
  if (canvas.value) {
    camera.offset.x = camera.offset.x + movementX / camera.zoom
    camera.offset.y = camera.offset.y + movementY / camera.zoom

    //check value
    imagesStore.selectedImage.camera.offset.x = Math.min(0, Math.max(-((imagesStore.selectedImage.size.width * camera.zoom) - canvas.value.width) / camera.zoom, camera.offset.x))
    imagesStore.selectedImage.camera.offset.y = Math.min(0, Math.max(-((imagesStore.selectedImage.size.height * camera.zoom) - canvas.value.height) / camera.zoom, camera.offset.y))
  }
}

function updateZoom(zoomDelta: number) {
  let camera = imagesStore.selectedImage.camera


  camera.zoom = +(camera.zoom * (1 + zoomDelta / 20)).toFixed(2)

  //check value
  imagesStore.selectedImage.camera.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, camera.zoom))
}


function zoomWithWheel(event: WheelEvent) {
  let oldZoom =  imagesStore.selectedImage.camera.zoom
  updateZoom(Math.sign(-event.deltaY))
  let deltaZoom =  imagesStore.selectedImage.camera.zoom / oldZoom

  //get pos mouse in canvas
  const svgRect = canvas.value!.getBoundingClientRect();
  let mouseX = event.pageX - svgRect.left
  let mouseY = event.pageY - svgRect.top

  //update offset
  let deltaOffsetX = -((svgRect.width * deltaZoom) - svgRect.width) * (mouseX / svgRect.width) // (dest offset - src offset) * ratio of pos mouse
  let deltaOffsetY = -((svgRect.height * deltaZoom) - svgRect.height) * (mouseY / svgRect.height)

  updateOffset(deltaOffsetX, deltaOffsetY)
  update()
}

function startDrag(event: MouseEvent) {
  let pos = getPos(event)
  if (event.button == 0) {
    dragging.value = true

    let landmark = checkPointCircle(pos)
    landmarkDragged.value = landmark
    draggedPos.value = pos
  }
  else if (event.button == 2) {
    if (!onImage(pos)) {
      // Image not clicked
      return;
    }
    let landmark = checkPointCircle(pos)
    if (landmark) {
      deleteLandmark(landmark)
    }
    else {
      // load depth and layer if generating landmark

      //pose = computePose(pos)
      switch (selectedImage.value.store.tab) {
        case "landmarks":
          generateLandmark(pos)
          break;
        case "distances":
          if (selectedImage.value.store.selectedDistance) {
            addLandmarkToDistance(pos, selectedImage.value.store.selectedDistance)
          } else {
            addDistance(pos)
            selectedImage.value.store.selectedDistanceIndex = selectedImage.value.store.distances.length - 1
          }
          break;
        case "profiles":
          if (selectedImage.value.store.selectedProfile) {
            addLandmarkToProfile(pos, selectedImage.value.store.selectedProfile)
          } else {
            addProfile(pos)
            selectedImage.value.store.selectedProfileIndex = selectedImage.value.store.profiles.length - 1
          }
          break;
      }
    }
    //triangulate landmark
    update()
    // reinit landmarkDrag
    //reinitDraggedLandmark()
  }
  update()
}

function mousemove(event: MouseEvent) {
  if (dragging.value == true) {
    if (landmarkDragged.value == null) {

      // no marker to drag => pan image
      updateOffset(event.movementX, event.movementY)
    }
    else {
      let pos = getPos(event)
      if(!onImage(pos)){
        pos = {
          x: max(0, min(imagesStore.selectedImage.size.width, pos.x)),
          y: max(0, min(imagesStore.selectedImage.size.height, pos.y))
        }
      }
      // drag marker
      draggedPos.value = pos
    }

    update()
  }
}

function stopDrag(event: MouseEvent) {
  dragging.value = false
  if (landmarkDragged.value != null) {
    //update pos of landmark
    let pos = getPos(event)
    if(!onImage(pos)){
      pos = {
        x: max(0, min(imagesStore.selectedImage.size.width, pos.x)),
        y: max(0, min(imagesStore.selectedImage.size.height, pos.y))
      }
    }
    let landmark = landmarkDragged.value
    landmark.pos = pos 
    if(profileDragged.value != null){
      let profile = profileDragged.value as Profile
      repository.computeLandmark(imagesStore.objectPath, imagesStore.selectedImage.name, pos).then((pose) => {
        landmark.setPose(pose)
        repository.computeProfile(imagesStore.objectPath, imagesStore.selectedImage.name, profile).then((profileLandmarks) => {
          if(profileLandmarks == undefined){
            return;
          }
            profile.landmarks.first!.pose = profileLandmarks.start
            profile.sub_landmarks = profileLandmarks.subLandmarks
            profile.landmarks.last!.pose = profileLandmarks.end
        })
      })
    }else{
      repository.computeLandmark(imagesStore.objectPath, imagesStore.selectedImage.name, pos).then((pose) => {
        landmark.setPose(pose)
      })
    }

    // reinit landmarkDrag
    reinitDraggedLandmark()
  }
  update()
}

function reinitDraggedLandmark() {
  landmarkDragged.value = null
  profileDragged.value = null
  draggedPos.value = { x: -1, y: -1 }
}

function printPos(event: MouseEvent) {
  let pos = getPos(event)
  console.log("Position = ", pos.x, " : ", pos.y)
}

function checkPointCircle(pos: Coordinates): Landmark | null {
  let landmarkClicked: Landmark | null = null
  selectedImage.value.store.landmarks.forEach((landmark) => {
    if (!landmark.show) {
      return;
    }
    landmarkClicked = checkDragLandmark(pos, landmark) || landmarkClicked
  })
  selectedImage.value.store.distances.forEach((distance) => {
    if (!distance.show) {
      return;
    }
    distance.landmarks.forEach((landmark) => {
      landmarkClicked = checkDragLandmark(pos, landmark) || landmarkClicked
    })
  })
  selectedImage.value.store.profiles.forEach((profile) => {
    if (!profile.show) {
      return;
    }
    profile.landmarks.forEach((landmark) => {
      landmarkClicked = checkDragLandmark(pos, landmark) || landmarkClicked
      if(landmark.equals(landmarkClicked)){
        profileDragged.value = profile
      }
      
    })
  })
  return landmarkClicked
}

function checkDragLandmark(pos: Coordinates, landmark: Landmark): Landmark | null {
  if (pointInsideCircle(landmark.pos, pos, DOT_RADIUS /  imagesStore.selectedImage.camera.zoom)) {
    return landmark
  }
  return null;
}

function pointInsideCircle(pointCoord: Coordinates, circleCoord: Coordinates, radius: number) {
  const distance =
    Math.sqrt((pointCoord.x - circleCoord.x) ** 2 + (pointCoord.y - circleCoord.y) ** 2);
  return distance < radius;
}

function onImage(pos: Coordinates): boolean {
  let ratio = getRatio()
  if (base_image.value) {
    return pos.x >= 0 && pos.y >= 0 && pos.x <= base_image.value.naturalWidth / ratio.width && pos.y <= base_image.value.naturalHeight / ratio.height
  }
  return false
}

async function addLandmarkToDistance(pos: Coordinates, distance: Distance) {
  let landmark = createLandmark(pos, distance.color)
  distance.landmarks.push(await landmark)
}

async function addDistance(pos: Coordinates) {
  let distance = new Distance("Distance " + (selectedImage.value.store.distances.length + 1))
  let index = selectedImage.value.store.distances.push(distance) - 1
  let landmark = createLandmark(pos, distance.color)
  selectedImage.value.store.distances[index]!.landmarks.push(await landmark);
}

async function addLandmarkToProfile(pos: Coordinates, profile: Profile) {
  let landmark = createLandmark(pos, profile.color)
  profile.addLandmark(await landmark)
  repository.computeProfile(imagesStore.objectPath, selectedImage.value.name, profile).then((profileLandmarks :  ProfileLandmarks | undefined) => {
    if(profileLandmarks == undefined){
      return;
    }
    profile.landmarks.first!.pose = profileLandmarks.start
    profile.sub_landmarks = profileLandmarks.subLandmarks
    profile.landmarks.last!.pose = profileLandmarks.end
  })
}

async function addProfile(pos: Coordinates) {
  let profile = new Profile("Profile " + (selectedImage.value.store.profiles.length + 1))
  let index = selectedImage.value.store.profiles.push(profile) - 1
  let landmark = createLandmark(pos, profile.color)
  selectedImage.value.store.profiles[index]!.landmarks.add(await landmark);
}

async function createLandmark(pos: Coordinates, color: Color | undefined = undefined): Promise<Landmark> {
  let id = selectedImage.value.store.generateID()
  let pose = await repository.computeLandmark(imagesStore.objectPath, imagesStore.selectedImage.name, pos).then((pose) => {
    return pose
  })

  let landmark =  new Landmark(id, id, pos, pose, color)
  return landmark
}



async function generateLandmark(pos: Coordinates) {
  selectedImage.value.store.landmarks.push(await createLandmark(pos))
}

function deleteLandmark(landmark: Landmark) {
  selectedImage.value.store.distances.forEach((dist, index) => {
    dist.landmarks = dist.landmarks.filter(x => !x.equals(landmark))
  })

  selectedImage.value.store.profiles.forEach((prof, index) => {
    prof.landmarks.remove(landmark)
  })

  selectedImage.value.store.landmarks = selectedImage.value.store.landmarks.filter(land => !land.equals(landmark))
  update()
  // reinit landmarkDrag
  reinitDraggedLandmark()
}
</script>

<template>
  <div ref="imageContainer"
    :class="cn('relative border w-full h-full flex justify-center items-center overflow-auto', props.class)"
    @wheel.prevent>

    <canvas ref="canvas" tabindex='1' :class="{ 'cursor-none': landmarkDragged, 'cursor-pointer': !landmarkDragged }"
      @mousedown="startDrag" @mouseup="stopDrag" @mousemove="mousemove" @mouseout="stopDrag" @wheel="zoomWithWheel"
      @contextmenu.prevent>
    </canvas>
  </div>

</template>

<style scoped>
.object-fit {
  display: flex;
  object-fit: contain;
  max-width: none;
}
</style>
