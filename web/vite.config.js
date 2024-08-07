import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          maximumFileSizeToCacheInBytes: 4000000,
        },
        devOptions: {
          enabled: true,
        },
        manifest: {
          name: '双人麻将',
          short_name: '双人麻将',
          description: '双人麻将',
          theme_color: '#000000',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        },
      }),
    ],
    base: env.VITE_BASE_URL || '/',
    esbuild: {
      jsx: 'transform',
      jsxFactory: 'm',
      jsxFragment: "'['",
    },
    css: {
      modules: {
        localsConvention: 'camelCase',
      },
    },
  };
});
