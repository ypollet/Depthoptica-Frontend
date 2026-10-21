<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import disscoLogo from '@/assets/images/credits/dissco.svg'
import belspoLogo from '@/assets/images/credits/belspo.jpg'
import rbinsLogo from '@/assets/images/credits/rbins.svg'
import africamuseumLogo from '@/assets/images/credits/africamuseum.svg'

import { useDark } from '@vueuse/core'


interface Developer {
  name: string
  role?: string
  url?: string
}

interface Organization {
  name: string
  logo?: string
  invert: boolean,
  url?: string
  projects?: string[]
}


const developers: Developer[] = [
  { name: 'Yann Pollet'},
]

const projects: Organization[] = [
  { name: 'BELSPO', invert: false, logo: belspoLogo, projects: ["DIGIT", "CANATHIST"] },
  { name: 'DiSSCo', invert: false, logo: disscoLogo, projects: ["BeDiSSCoFED"] },
]

const institutions: Organization[] = [
  { name: 'Royal Belgian Institute of Natural Sciences', invert: true, logo: rbinsLogo, url: 'https://www.naturalsciences.be' },
  { name: 'Royal Museum for Central Africa', invert: true, logo: africamuseumLogo, url: 'https://www.africamuseum.be' },
]

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

const isDark = useDark({
  storageKey: 'localStorage'
})
</script>

<template>
  <Card class="flex h-full min-h-full w-full max-w-full min-w-0 overflow-x-hidden overflow-y-auto">
    <CardContent class="flex flex-col w-full min-w-0 space-y-6 p-6">
      <!-- Developers -->
      <section>
        <h4 class="text-base font-semibold">Developers</h4>
        <ul class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 pl-5">
          <li v-for="dev in developers" :key="dev.name" class="flex flex-col">
            <a v-if="dev.url" :href="dev.url" target="_blank" rel="noopener noreferrer"
              class="font-medium hover:underline">
              {{ dev.name }}
            </a>
            <span v-else class="font-medium">{{ dev.name }}</span>
            <span v-if="dev.role" class="text-sm text-muted-foreground">{{ dev.role }}</span>
          </li>
        </ul>
      </section>

      <Separator />

      <!-- Projects & Institutions share the same logo + name layout -->
      <template v-for="(group, index) in [
        { title: 'Projects', items: projects },
        { title: 'Institutions', items: institutions },
      ]" :key="group.title">
        <Separator v-if="index > 0" />
        <section>
          <h4 class="text-base font-semibold">{{ group.title }}</h4>
          <ul class="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
            <li v-for="item in group.items" :key="item.name">
              <component :is="item.url ? 'a' : 'div'" :href="item.url"
                :target="item.url ? '_blank' : undefined" :rel="item.url ? 'noopener noreferrer' : undefined"
                class="flex h-full flex-col items-center gap-2 rounded-md border p-4 text-center transition-colors"
                :class="item.url && 'hover:bg-accent'">
                <div class="flex h-20 w-full items-center justify-center">
                  <img v-if="item.logo" :src="item.logo" :alt="`${item.name} logo`"
                    class="max-h-20 max-w-full object-contain"
                    :class="isDark && item.invert && 'invert'" />
                  <div v-else
                    class="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground">
                    {{ initials(item.name) }}
                  </div>
                </div>
                <span class="text-sm font-medium">{{ item.name }}</span>
                <ul v-if="item.projects?.length" class="flex flex-wrap justify-center gap-1">
                  <li v-for="project in item.projects" :key="project"
                    class="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {{ project }}
                  </li>
                </ul>
              </component>
            </li>
          </ul>
        </section>
      </template>
    </CardContent>
  </Card>
</template>
