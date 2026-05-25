import fs from 'node:fs'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

function extensionBuildPlugin(outDir: string): Plugin {
  return {
    name: 'extension-build',
    closeBundle() {
      const root = path.resolve(__dirname)
      const output = path.resolve(root, outDir)

      fs.copyFileSync(
        path.join(root, 'extension', 'manifest.json'),
        path.join(output, 'manifest.json'),
      )

      for (const file of ['favicon.svg', 'icons.svg']) {
        const source = path.join(root, 'public', file)
        if (fs.existsSync(source)) {
          fs.copyFileSync(source, path.join(output, file))
        }
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isExtension = mode === 'extension'

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(isExtension ? [extensionBuildPlugin('dist-extension')] : []),
    ],
    base: isExtension ? './' : '/',
    build: {
      outDir: isExtension ? 'dist-extension' : 'dist',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
