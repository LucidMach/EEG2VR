// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
server: { host: true },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['three', 'react', 'react-dom']
    },
    build: {
      chunkSizeWarningLimit: 2500,
      cssMinify: true,
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('troika')) {
                return 'vendor-troika';
              }
              if (id.includes('@react-three/fiber')) {
                return 'vendor-r3f';
              }
              if (id.includes('three-stdlib')) {
                return 'vendor-three-stdlib';
              }
              if (id.includes('three')) {
                return 'vendor-three';
              }
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
            }
          }
        }
      }
    },
    esbuild: {
      drop: ['console', 'debugger'],
      legalComments: 'none'
    },
  }
});