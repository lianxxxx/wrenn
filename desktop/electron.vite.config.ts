import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      rolldownOptions: {
        // The app, plus a small dev tool that renders a scene from the terminal
        input: {
          index: resolve('src/main/index.ts'),
          'render-cli': resolve('src/main/render/cli.ts')
        }
      }
    }
  },
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    // Shrink the app's JavaScript in the built app (about 615 kB down to about 200 kB)
    build: { minify: true },
    server: {
      fs: {
        // The shared brand tokens live in ../brand, outside this folder
        allow: [resolve('.'), resolve('../brand')]
      }
    }
  }
})
