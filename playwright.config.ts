import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

// Load .env.local so test code can access Supabase keys without pre-exporting
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export default defineConfig({
  testDir: './tests',
  testMatch: ['agent.ts'],
  // Never run flows in parallel — they share DB state within a single run
  workers: 1,
  // Allow a slow upload + scan cycle
  timeout: 90_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    // Capture trace on the first retry so failures are debuggable
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Auto-start the dev server if not already running
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    // Reuse an already-running server in dev (avoids port conflicts)
    reuseExistingServer: true,
    timeout: 120_000,
    env: {
      // Forward Supabase keys into the Next.js dev process
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    },
  },

  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
});
