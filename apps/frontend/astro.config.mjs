// @ts-check
import { defineConfig } from 'astro/config';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

const appDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(appDir, '../..');

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: node({
    mode: 'standalone'
  }),

  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [appDir, repoRoot],
      },
    },
  }
});
