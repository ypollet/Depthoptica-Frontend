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

import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'


import tailwindcss from 'tailwindcss'
import autoprefixer from "autoprefixer"


// https://vitejs.dev/config/
export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss(),autoprefixer()],
    },
  },
  plugins: [
    vue(),
    vueJsx(),
  ],
  server: {
    watch: {
      usePolling: true,
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
          }else if (id.includes('/node_modules/@tanstack')) {
            return 'vendor_@tanstack';
          }else if (id.includes('/node_modules/lucide-vue-next')) {
            return 'vendor_lucide-vue-next';
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
