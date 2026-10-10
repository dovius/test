import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'vite';
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

// Use the real Vue SFC compiler and renderer, without a browser dependency.
test('renders only lowercase welcome as accessible page text', async () => {
  const vite = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
  });

  try {
    const { default: App } = await vite.ssrLoadModule('/src/App.vue');
    const html = await renderToString(createSSRApp(App));
    assert.equal(html, '<main><h1>welcome</h1></main>');
  } finally {
    await vite.close();
  }
});
