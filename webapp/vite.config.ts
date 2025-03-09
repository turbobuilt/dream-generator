import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { hostname } from 'os'
import vuetify from 'vite-plugin-vuetify'
// import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vuetify({ autoImport: true }), // Enabled by default
        // VitePWA({
        //     injectRegister: "script",
        //     registerType: 'autoUpdate',
        //     workbox: {
        //         globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        //     },
        //     manifest: {
        //         // id: "com.dreamgenerator.ai",
        //         scope: "/",
        //         name: "Dream Generator AI",
        //         short_name: "Dream Generator",
        //         theme_color: "#c5b022",
        //         display: "standalone",
        //         orientation: "portrait",
        //         "screenshots": [
        //             {
        //                 "src": "screenshots/iphone_max/1.avif",
        //                 "sizes": "1290x2796",
        //                 "type": "image/avif",
        //                 // "form_factor": "narr",
        //                 "label": "Dream Generator AI"
        //             },
        //             {
        //                 "src": "screenshot2.webp",
        //                 "sizes": "1290x2796",
        //                 "type": "image/avif",
        //                 // "form_factor": "wide",
        //                 "label": "Dream Generator AI"
        //             }
        //         ],
        //         icons: [
        //             {
        //                 src: 'logo_192x192.png',
        //                 sizes: '192x192',
        //                 type: 'image/png'
        //             },
        //             {
        //                 src: 'logo_512x512.png',
        //                 sizes: '512x512',
        //                 type: 'image/png'
        //             }
        //         ]
        //     }
        // }),
        // wasm(),
        // topLevelAwait()
    ],
    optimizeDeps: {
        exclude: ["@jsquash/avif", "@jsquash/jpeg", "@jsquash/jxl", "@jsquash/png", "@jsquash/webp"],
    },
    base: "/app/",
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        // open: "create",
        proxy: {
            '/api': {
                target: 'http://localhost:5005',
                changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
        https: {
            // read from ssl2/localhost.crt and pem
            // key: `${__dirname}/ssl/local.dreamgenerator.ai.key`,
            // cert: `${__dirname}/ssl/local.dreamgenerator.ai.crt`,
            key: `${__dirname}/ssl/localhost.key`,
            cert: `${__dirname}/ssl/localhost.crt`,
        }
    },
    publicDir: `${__dirname}/../website/static`,
    // build: {
    //     transpile: ["@jsquash/png"],
    // },
    build: {
        rollupOptions: {
            external: ["@jsquash/avif", "@jsquash/jpeg", "@jsquash/jxl", "@jsquash/png", "@jsquash/webp"],
            // output: {
            //     manualChunks: {}
            // }
        }
    },
    worker: {
        // Not needed with vite-plugin-top-level-await >= 1.3.0
        format: "es",
        // plugins: [
            // wasm(),
            // topLevelAwait()
        // ]
    }
})
