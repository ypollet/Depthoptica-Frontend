// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///home/psadmin/Numerisation/Stackoptica/Orthanc/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///home/psadmin/Numerisation/Stackoptica/Orthanc/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueJsx from "file:///home/psadmin/Numerisation/Stackoptica/Orthanc/frontend/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";
import tailwind from "file:///home/psadmin/Numerisation/Stackoptica/Orthanc/frontend/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///home/psadmin/Numerisation/Stackoptica/Orthanc/frontend/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_import_meta_url = "file:///home/psadmin/Numerisation/Stackoptica/Orthanc/frontend/vite.config.ts";
var vite_config_default = defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()]
    }
  },
  plugins: [
    vue(),
    vueJsx()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  build: {
    assetsDir: "static",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("/node_modules/vuedraggable")) {
            return "vendor_vuedraggable";
          } else if (id.includes("/node_modules/mathjs")) {
            return "vendor_mathjs";
          } else if (id.includes("/node_modules/@vue")) {
            return "vendor_@vue";
          } else if (id.includes("/node_modules/")) {
            return "vendor";
          } else {
            return "index";
          }
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wc2FkbWluL051bWVyaXNhdGlvbi9TdGFja29wdGljYS9PcnRoYW5jL2Zyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wc2FkbWluL051bWVyaXNhdGlvbi9TdGFja29wdGljYS9PcnRoYW5jL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3BzYWRtaW4vTnVtZXJpc2F0aW9uL1N0YWNrb3B0aWNhL09ydGhhbmMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCdcblxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHZ1ZUpzeCBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUtanN4J1xuXG5cbmltcG9ydCB0YWlsd2luZCBmcm9tIFwidGFpbHdpbmRjc3NcIlxuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tIFwiYXV0b3ByZWZpeGVyXCJcblxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgY3NzOiB7XG4gICAgcG9zdGNzczoge1xuICAgICAgcGx1Z2luczogW3RhaWx3aW5kKCksIGF1dG9wcmVmaXhlcigpXSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgdnVlSnN4KCksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgYXNzZXRzRGlyOiBcInN0YXRpY1wiLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IChpZCkgPT4ge1xuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL25vZGVfbW9kdWxlcy92dWVkcmFnZ2FibGUnKSkge1xuICAgICAgICAgICAgcmV0dXJuICd2ZW5kb3JfdnVlZHJhZ2dhYmxlJztcbiAgICAgICAgICB9IGVsc2UgaWYgKGlkLmluY2x1ZGVzKCcvbm9kZV9tb2R1bGVzL21hdGhqcycpKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvcl9tYXRoanMnO1xuICAgICAgICAgIH1lbHNlIGlmIChpZC5pbmNsdWRlcygnL25vZGVfbW9kdWxlcy9AdnVlJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yX0B2dWUnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoaWQuaW5jbHVkZXMoJy9ub2RlX21vZHVsZXMvJykpIHtcbiAgICAgICAgICAgIHJldHVybiAndmVuZG9yJztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuICdpbmRleCc7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVYsU0FBUyxlQUFlLFdBQVc7QUFFMVgsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sWUFBWTtBQUduQixPQUFPLGNBQWM7QUFDckIsT0FBTyxrQkFBa0I7QUFSNkwsSUFBTSwyQ0FBMkM7QUFZdlEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLE1BQ1AsU0FBUyxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUM7QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLE9BQU87QUFBQSxFQUNUO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3REO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsV0FBVztBQUFBLElBQ1gsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYyxDQUFDLE9BQU87QUFDcEIsY0FBSSxHQUFHLFNBQVMsNEJBQTRCLEdBQUc7QUFDN0MsbUJBQU87QUFBQSxVQUNULFdBQVcsR0FBRyxTQUFTLHNCQUFzQixHQUFHO0FBQzlDLG1CQUFPO0FBQUEsVUFDVCxXQUFVLEdBQUcsU0FBUyxvQkFBb0IsR0FBRztBQUMzQyxtQkFBTztBQUFBLFVBQ1QsV0FBVyxHQUFHLFNBQVMsZ0JBQWdCLEdBQUc7QUFDeEMsbUJBQU87QUFBQSxVQUNULE9BQU87QUFDTCxtQkFBTztBQUFBLFVBQ1Q7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
