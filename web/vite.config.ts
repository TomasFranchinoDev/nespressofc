import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        // Three.js va en su propio chunk: solo se descarga si el dispositivo puede con el 3D.
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) return 'three';
          if (id.includes('gsap') || id.includes('lenis')) return 'scroll';
        },
      },
    },
  },
});
