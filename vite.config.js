import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { getBuildCommit } from './scripts/build-info.js';

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'build-commit-metadata',
      apply: 'build',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'build-info.json',
          source: `${JSON.stringify({ commit: getBuildCommit() })}\n`,
        });
      },
    },
  ],
});
