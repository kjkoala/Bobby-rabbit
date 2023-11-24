import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import { svelte } from "@sveltejs/vite-plugin-svelte"
import preprocess from "svelte-preprocess"

export default defineConfig({
  assetsInclude: ['**/*.tmx'],
  base: '/bobby/',
    plugins: [
        svelte({
            preprocess: preprocess()
        }),
    ],
    resolve: {
        alias: {
            'src': fileURLToPath(new URL('./src', import.meta.url)),
            'public': fileURLToPath(new URL('./public', import.meta.url)),
          },
      },
})