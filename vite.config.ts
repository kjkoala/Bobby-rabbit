import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import compress from "vite-plugin-compress"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import preprocess from "svelte-preprocess"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  assetsInclude: ['**/*.tmx'],
  base: '/bobby/',
    plugins: [
        svelte({
            preprocess: preprocess()
        }),
        // compress.default({
        //     verbose: true,
        //     exclude: ["index.html"],
        //   }),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
            manifest: {
              name: "Bobby Carrot",
              short_name: "FlappyBird",
              description: "Fly and Lie",
              theme_color: "#ffffff",
              icons: [
                {
                  src: "pwa-192x192.png",
                  sizes: "192x192",
                  type: "image/png",
                },
                {
                  src: "pwa-512x512.png",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
            },
          }),
    ],
    resolve: {
        alias: {
            'src': fileURLToPath(new URL('./src', import.meta.url)),
            'public': fileURLToPath(new URL('./public', import.meta.url)),
          },
      },
})