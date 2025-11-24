import { defineConfig } from 'vite';
import { qrcode } from 'vite-plugin-qrcode'; // Geändert zu benanntem Import

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    qrcode(), // Funktionsaufruf bleibt gleich
  ],
});
