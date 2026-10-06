import { defineConfig, devices } from '@playwright/test';

// A separately running API is optional; the default browser suite mocks signup.
const backendUrl = process.env.E2E_BACKEND_URL || 'http://127.0.0.1:3001';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  use: { baseURL: 'http://127.0.0.1:5174', channel: process.platform === 'win32' ? 'chrome' : undefined, screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: [
    { command: 'npm run dev -- --port 5174', url: 'http://127.0.0.1:5174', env: { API_PROXY_TARGET: backendUrl, VITE_API_BASE_URL: '' }, reuseExistingServer: false },
  ],
});
