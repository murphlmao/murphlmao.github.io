import { test, expect, type Page } from '@playwright/test';
import { readInk } from './helpers';

/* The M drew in black on the dark background in Safari, leaving only the white beam
   tip visible: WebKit runs module scripts while <link rel=stylesheet> is still loading,
   so pen.ts read '' for --mich and measured the canvas at its unstyled 300x150.
   main.ts now starts the canvas modules from whenStylesReady(). */

const SLOW_CSS_MS = 1200;

function slowStylesheets(page: Page) {
  return page.route('**/_astro/*.css', async (route) => {
    await new Promise((r) => setTimeout(r, SLOW_CSS_MS));
    await route.continue();
  });
}

/** Chrome and Firefox hold module scripts until render-blocking CSS lands, which hides
    the race. Loading the sheets the async way (media=print, flipped on load) makes them
    non-blocking, so the script really does run first here, as it does in WebKit. */
function asyncStylesheets(page: Page) {
  return page.route('**/', async (route) => {
    const res = await route.fetch();
    const html = (await res.text()).replace(/<link rel="stylesheet"/g, '<link media="print" onload="this.media=\'all\'" rel="stylesheet"');
    await route.fulfill({ response: res, body: html });
  });
}

async function expectMaizeM(page: Page) {
  await expect.poll(async () => (await readInk(page)).maize, { timeout: 15_000 }).toBeGreaterThan(300);
  const ink = await readInk(page);
  expect(ink.black, 'ink drawn in the canvas default colour').toBe(0);
  expect(ink.backing, 'canvas measured before its CSS size applied').toBe(ink.expected);
}

test('the M draws in maize', async ({ page }) => {
  await page.goto('/');
  await expectMaizeM(page);
});

test('the M draws in maize when the stylesheet is slow', async ({ page }) => {
  await slowStylesheets(page);
  await page.goto('/');
  await expectMaizeM(page);
});

test('the M draws in maize when the script runs before the stylesheet', async ({ page }) => {
  await asyncStylesheets(page);
  await slowStylesheets(page);
  await page.goto('/');
  await expectMaizeM(page);
});

test('the M follows a saved "accent" colour', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tweaks', JSON.stringify({ mich: 'accent' })));
  await asyncStylesheets(page);
  await slowStylesheets(page);
  await page.goto('/');
  /* ember accent #D7263D: not maize, not black */
  await expect.poll(async () => (await readInk(page)).other, { timeout: 15_000 }).toBeGreaterThan(300);
  const ink = await readInk(page);
  expect(ink.black).toBe(0);
  expect(ink.maize).toBe(0);
});
