import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    vue(),
    electron({
      entry: 'src/main/index.js',
      onstart(options) {
        options.startup();
      },
    }),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
