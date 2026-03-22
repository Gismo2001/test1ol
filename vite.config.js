import { defineConfig } from 'vite';


export default defineConfig({
  build: {
    sourcemap: true,
  },
  server: {
    proxy: {

      // Proxy für LGN-STAC (bestehend)
      '/lgln-stac': {
        target: 'https://dgm.stac.lgln.niedersachsen.de',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/lgln-stac/, ''),
      },

      // Proxy für DGM GeoTIFFs
      '/dgm': {
        target: 'https://dgm1.s3.eu-de.cloud-object-storage.appdomain.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/dgm/, '')
        },

      // Proxy für DOM GeoTIFFs
      '/dom': {
        target: 'https://dom1.s3.eu-de.cloud-object-storage.appdomain.cloud',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/dom/, ''),
      }

    },
  },
});