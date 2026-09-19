import { defineConfig, devices } from '@playwright/test';

/* UI tests run against the built site (`astro preview`), headless, on a port of their
   own so a running `pnpm dev` (3000) is left alone. `chrome` drives the installed Google
   Chrome, so there is no browser download; `webkit` is the engine the stylesheet race
   in tests/pen.spec.ts was found in, and needs `pnpm exec playwright install webkit`
   (Playwright ships no WebKit build for Arch, so it is opt-in: PW_WEBKIT=1). */
const PORT = 4399;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  webServer: {
    command: `pnpm build && pnpm exec astro preview --host 127.0.0.1 --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chrome-phone', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    { name: 'chrome-desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    ...(process.env.PW_WEBKIT ? [{ name: 'webkit-phone', use: { ...devices['iPhone 14'] } }] : []),
  ],
});
