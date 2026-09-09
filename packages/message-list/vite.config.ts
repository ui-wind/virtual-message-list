import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vitest/config'

const ext = {
  cjs: 'cjs',
  es: 'mjs',
}

const inLadle = process.env.LADLE !== undefined

export default inLadle
  ? defineConfig({
      plugins: [react()],
    })
  : defineConfig({
      build: {
        lib: {
          entry: ['src/index.ts'],
          // @ts-expect-error vite types
          fileName: (format) => `index.${ext[format]}`,
          formats: ['es', 'cjs'],
        },
        minify: true,
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime', '@virtuoso.dev/gurx'],
        },
        target: ['es2022', 'edge109', 'firefox115', 'chrome109', 'safari16'],
      },
      plugins: [react(), dts({ rollupTypes: true })],
      test: {
        environment: 'jsdom',
        include: ['test/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
      },
    })
