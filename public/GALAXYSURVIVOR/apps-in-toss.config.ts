import { defineConfig } from '@apps-in-toss/web-framework/config';

// Replace appName with the exact identifier registered in the Apps in Toss console.
export default defineConfig({
  appName: 'starfall-shooter',
  brand: { primaryColor: '#405BAF' },
  webView: {},
  permissions: [],
  webBundleDir: 'dist',
});
