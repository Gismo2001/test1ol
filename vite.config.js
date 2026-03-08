import { defineConfig } from 'vite';
import { qrcode } from 'vite-plugin-qrcode'; // Geändert zu benanntem Import

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    qrcode(), // Funktionsaufruf bleibt gleich
  ],
  server: {
    
    proxy: {
      '/lgln-stac': {
        target: 'https://dgm.stac.lgln.niedersachsen.de',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/lgln-stac/, ''),
      },
    },
  },
});
