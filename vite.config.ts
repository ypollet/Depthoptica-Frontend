// Stackoptica - 3D Viewer on calibrated images - Frontend

// Copyright (C) 2024 Yann Pollet, Royal Belgian Institute of Natural Sciences

//

// This program is free software: you can redistribute it and/or

// modify it under the terms of the GNU General Public License as

// published by the Free Software Foundation, either version 3 of the

// License, or (at your option) any later version.

// 

// This program is distributed in the hope that it will be useful, but

// WITHOUT ANY WARRANTY; without even the implied warranty of

// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU

// General Public License for more details.

//

// You should have received a copy of the GNU General Public License

// along with this program. If not, see <http://www.gnu.org/licenses/>.

import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'


import tailwind from "tailwindcss"
import autoprefixer from "autoprefixer"


// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [
    vue(),
    vueJsx(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  base: "./",
  build: {
    assetsDir: "static",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('/node_modules/vuedraggable')) {
            return 'vendor_vuedraggable';
          } else if (id.includes('/node_modules/mathjs')) {
            return 'vendor_mathjs';
          }else if (id.includes('/node_modules/@vue')) {
            return 'vendor_@vue';
          } else if (id.includes('/node_modules/')) {
            return 'vendor';
          } else {
            return 'index';
          }
        },
      },
    },
  },
})
