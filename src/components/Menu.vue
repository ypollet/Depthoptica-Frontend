<script setup lang="ts">
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { HelpGuide } from './ui/help'
import Color from "color"

import { Landmark } from '@/data/models/landmark'
import { Distance } from '@/data/models/distance'


import { useToggle, useDark } from '@vueuse/core'
import { useSettingsStore, useImagesStore } from '@/lib/stores'
import saveAs from 'file-saver';
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const settingsStore = useSettingsStore()
const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)


const isDark = useDark({
  storageKey: 'localStorage'
})

const toggleDark = useToggle(isDark)

function downloadCsv() {

  const rows = [
    ["Distance", "Label", "Color", "Pose_X", "Pose_Y", "Image", "ImageLabel"]
  ];

  selectedImage.value.store.distances.forEach((distance) => {
    distance.landmarks.forEach((landmark) => {
      landmark = landmark as Landmark
      let pose = landmark.pose
      let row: Array<string> = [distance.label, landmark.label, landmark.getColorHEX(), pose.x.toString(), pose.y.toString(), selectedImage.value.name, selectedImage.value.label]
      rows.push(row)
    })
  })

  let csvContent = rows.map(e => e.join(";")).join("\n");

  let blob: Blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, "landmarks_" + imagesStore.objectPath + ".csv")

}

function downloadJSON() {

  const data: Map<string, any> = new Map()

  data.set('scale_factor', selectedImage.value.store.adjustFactor)

  let distances = new Array<Object>()

  selectedImage.value.store.distances.forEach((distance) => {
    let listLandmarks = new Array<Object>()

    distance.landmarks.forEach((landmark) => {
      listLandmarks.push({
        "id": landmark.id,
        "label": landmark.label,
        "color": landmark.getColorHEX(),
        "pose": landmark.pose
      })
    })

    let distanceObject = {
      "label": distance.label,
      "color": distance.getColorHEX(),
      "landmarks": JSON.parse(JSON.stringify(listLandmarks))
    }
    distances.push(distanceObject)
  })
  data.set('distances', distances)


  var blob = new Blob([JSON.stringify(Object.fromEntries(data.entries()))], { type: "application/json;charset=utf-8" });
  saveAs(blob, "landmarks_" + imagesStore.objectPath + "_" + new Date().getTime() + ".json");

}

function onSubmit(event: Event) {

  event.preventDefault()
  let form = event.target as HTMLFormElement
  let inputFile = form.elements[0] as HTMLInputElement
  let file = inputFile.files![0] as Blob
  if (file) {
    file.text().then((text) => {
      importLandmarks(text)
    }).catch((reason) => {
      console.error(reason)
    })
  }

}
function importLandmarks(jsonData: string) {

  let jsonObject = JSON.parse(jsonData)
  let mapData: Map<string, any> = new Map(Object.entries(jsonObject));
  selectedImage.value.store.adjustFactor = mapData.get("scale_factor")


  let mapDistances: Array<Object> = mapData.get("landmarks")
  mapDistances.forEach((distanceObject: Object, index: number) => {
    let distanceMap = new Map(Object.entries(distanceObject));

    let landmarks = distanceMap.get("landmarks").map((landmarkObject: Object) => {
      let landmarkMap = new Map(Object.entries(landmarkObject))
      return new Landmark(selectedImage.value.store.generateID(), landmarkMap.get("label"), landmarkMap.get("pos"), landmarkMap.get("pose"), Color(landmarkMap.get("color")))
    })

    let distance = new Distance(distanceMap.get("label"), landmarks, Color(distanceMap.get("color")))
    selectedImage.value.store.distances.push(distance)
  })

}

const isImportDialogOpen = ref<boolean>(false)
const setIsImportDialogOpen = useToggle(isImportDialogOpen)

const isHelpGuideDialogOpen = ref<boolean>(false)
const setIsHelpGuideDialogOpen = useToggle(isHelpGuideDialogOpen)

</script>

<template>
  <div>
    <Menubar class="rounded border-b z-100 h-10">
      <MenubarMenu>
        <MenubarTrigger class="relative">
          File
        </MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>
            Landmarks
          </MenubarLabel>
          <MenubarItem inset @select="setIsImportDialogOpen(true)">Import</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger inset>Export</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem @select="downloadCsv">
                CSV
              </MenubarItem>
              <MenubarItem @select="downloadJSON">
                JSON
              </MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem disabled>
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          Settings
        </MenubarTrigger>
        <MenubarContent>
          <MenubarLabel inset>
            <div class="flex flex-row justify-between h-full w-full"><span>Dark Mode :</span>
              <Switch :checked="isDark" @update:checked="toggleDark" class="inline-block align-middle ml-auto">
              </Switch>
            </div>
          </MenubarLabel>
          <MenubarLabel inset>
            <div class="flex flex-row justify-between h-full w-full"><span>Reverse Mode :</span>
              <Switch :checked="settingsStore.isLeft" @update:checked="settingsStore.useToggleLeft"
                class="inline-block align-middle self-end"></Switch>
            </div>
          </MenubarLabel>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Help</MenubarTrigger>
        <MenubarContent>
          <MenubarItem inset @select="setIsHelpGuideDialogOpen(true)">
            How to use ?
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>

    <!-- Import Dialog-->
    <Dialog :open="isImportDialogOpen" @update:open="setIsImportDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add the landmark file</DialogTitle>
          <DialogDescription>Add the json files containing the landmarks</DialogDescription>
        </DialogHeader>
        <form @submit="onSubmit">
          <Label>File</Label>
          <Input type="file" placeholder="your landmark json file" />
          <DialogFooter>
            <DialogClose as-child>
              <Button type="submit">Confirm</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Hel Guide Dialog -->
    <Dialog :open="isHelpGuideDialogOpen" @update:open="setIsHelpGuideDialogOpen">
      <DialogContent class="flex h-[85vh] w-[50vw] max-w-none flex-col overflow-hidden">
        <DialogHeader class="shrink-0">
          <DialogTitle>App guide</DialogTitle>
          <DialogDescription>
            Quick instructions for Depthoptica.
          </DialogDescription>
        </DialogHeader>
        <div id="div-carousel" class="min-h-0 h-full w-full flex-1 overflow-y-auto overflow-x-hidden">
          <HelpGuide />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>