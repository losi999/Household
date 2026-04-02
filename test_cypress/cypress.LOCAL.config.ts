import { defineConfig } from 'cypress';
import { default as plugins } from './src/plugins';

export default defineConfig({
  viewportWidth: 0,
  viewportHeight: 0,
  defaultCommandTimeout: 10000,
  videoCompression: false,
  e2e: {
    setupNodeEvents(on) {
      return plugins(on);
    },
    specPattern: 'src/api/**/*.spec.ts',
    supportFile: 'src/support',
    baseUrl: 'https://local-householdapi.losi999.hu',
    experimentalRunAllSpecs: true,
  },
});
