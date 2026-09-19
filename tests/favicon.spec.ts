import { test, expect, type Page } from '@playwright/test';
import { faviconHref, saveTweaks } from './helpers';

/* The tab icon turns with the sidebar orb, under the orb's own switches (orb.ts). */

/** Distinct hrefs seen over ~1s. */
async function sampleFavicon(page: Page): Promise<string[]> {
  const seen = new Set<string>();
  for (let i = 0; i < 6; i++) {
    seen.add(await faviconHref(page));
    await page.waitForTimeout(180);
  }
  return [...seen];
}

test('the favicon animates while the orb spins', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => faviconHref(page)).toMatch(/^data:image\/png/);
  const frames = await sampleFavicon(page);
  expect(frames.length).toBeGreaterThan(2);
  for (const f of frames) expect(f).toMatch(/^data:image\/png/);
});

test('the favicon stays within ~10 updates a second', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => faviconHref(page)).toMatch(/^data:image\/png/);
  const changes = await page.evaluate(() => new Promise<number>((resolve) => {
    let n = 0;
    const mo = new MutationObserver((recs) => { n += recs.length; });
    mo.observe(document.getElementById('favicon')!, { attributes: true, attributeFilter: ['href'] });
    setTimeout(() => { mo.disconnect(); resolve(n); }, 1000);
  }));
  expect(changes).toBeGreaterThan(3);
  expect(changes).toBeLessThanOrEqual(12);
});

test('the favicon is still under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect.poll(() => faviconHref(page)).toMatch(/^data:image\/png/);
  expect(await sampleFavicon(page)).toHaveLength(1);
});

test('the favicon is still with orb spin off', async ({ page }) => {
  await saveTweaks(page, { orb: 0 });
  await page.goto('/');
  await expect.poll(() => faviconHref(page)).toMatch(/^data:image\/png/);
  expect(await sampleFavicon(page)).toHaveLength(1);
});

test('a static mark keeps its svg favicon', async ({ page }) => {
  await saveTweaks(page, { logo: 'mark-a' });
  await page.goto('/');
  await expect.poll(() => faviconHref(page)).toMatch(/^data:image\/svg\+xml/);
  const frames = await sampleFavicon(page);
  expect(frames).toHaveLength(1);
  expect(frames[0]).toMatch(/^data:image\/svg\+xml/);
});

test('turning orb spin off in settings stops the favicon', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => faviconHref(page)).toMatch(/^data:image\/png/);
  expect((await sampleFavicon(page)).length).toBeGreaterThan(2);
  await page.evaluate(() => {
    const el = document.querySelector<HTMLInputElement>('#tweaks [name="orb"]')!;
    el.checked = false;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(250);
  expect(await sampleFavicon(page)).toHaveLength(1);
});
