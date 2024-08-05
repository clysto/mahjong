import { defineConfig } from 'vite';

export default defineConfig({
  base: '/mahjong/',
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
});
