import { defineConfig } from 'vite';

export default defineConfig({
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
