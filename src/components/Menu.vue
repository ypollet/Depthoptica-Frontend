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
import { useSettingsStore, useImagesStore, type LandmarkInfo } from '@/lib/stores'
import saveAs from 'file-saver';
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { Store, type StackImage } from '@/data/models/stack_image'

const settingsStore = useSettingsStore()
const imagesStore = useImagesStore()
const { selectedImage } = storeToRefs(imagesStore)


const isDark = useDark({
  storageKey: 'localStorage'
})

const toggleDark = useToggle(isDark)

function downloadCsv() {

  const rows = [
    ["Image", "Distance", "Label", "Color", "Pose_X", "Pose_Y", "Pose_Z"]
  ];

  imagesStore.images.forEach((image) => {
    image.store.landmarks.forEach((landmark) => {
      rows.push(landmark.toCSV(image.name, ""))
    })
    image.store.distances.forEach((distance) => {
      distance.landmarks.forEach((landmark) => {
        landmark = landmark as Landmark
        rows.push(landmark.toCSV(image.name, distance.label))
      })
    })
    image.store.profiles.forEach((profile) => {
      profile.landmarks.forEach((landmark) => {
        landmark = landmark as Landmark
        rows.push(landmark.toCSV(image.name, profile.label))
      })
    })
  })

  let csvContent = rows.map(e => e.join(";")).join("\n");

  let blob: Blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, "landmarks_" + imagesStore.objectPath + "_" + new Date().getTime() + ".csv")

}

function downloadJSON() {

  const data: Map<string, any> = new Map()

  imagesStore.images.forEach((image) => {
    data.set(image.name, image.store.toJSON())
  })
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
  let importedStores: Map<string, any> = new Map(Object.entries(jsonObject));

  imagesStore.images.forEach((image) => {

    image = image as StackImage
    let store = image.store
    let storeObject = importedStores.get(image.name)
    if (!storeObject) {
      return
    }
    // Combine two stores
    console.log("Combining store for " + image.name)
    let importedStore = Store.fromJSON(storeObject)
    store.updateStore(importedStore)

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