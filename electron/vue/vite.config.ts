import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import commonjsExternals from 'vite-plugin-commonjs-externals';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    commonjsExternals({
      externals: ['path',"modelfusion","jimp","fs","fs/promises","openvino-node","child_process","electron","electron-is-dev","electron-store","electron-updater","electron-log","electron-reload"],
    }),
  ],
  base: "./",
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', "modelfusion", '@ffmpeg/util', 'openvino-node', "child_process", "fs", "fs/promises", "path", "electron"]
  },
})
