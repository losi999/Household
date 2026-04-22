import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';

config();

export default defineConfig({
  testDir: 'src',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  workers: process.env.ENV ? 1 : 4,
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never', 
      },
    ],
  ],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'], 
      },
    },
  ],
});
