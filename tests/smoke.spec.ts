import { test, expect } from '@playwright/test';

/* Every page with a pen scene: loads without script errors, and the scene ends up inked. */
const PAGES = ['/', '/articles', '/articles/binary-search-trees', '/resume', '/resources', '/deer'];

for (const path of PAGES) {
  test(`${path} loads clean and its pen scene draws`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(path);
    await expect.poll(() => page.evaluate(() => {
      const c = document.querySelector<HTMLCanvasElement>('canvas.pen')!;
      const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
      let inked = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 40) inked++;
      return inked;
    }), { timeout: 15_000 }).toBeGreaterThan(150);
    expect(errors).toEqual([]);
  });
}

test('the page never scrolls sideways', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over, path).toBeLessThanOrEqual(0);
  }
});

test('phone: the menu sheet opens, locks the page, and closes on Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the sheet only exists under 900px');
  await page.goto('/');
  const btn = page.locator('.side__menuBtn');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('body')).toHaveClass(/is-locked/);
  await expect(page.locator('#sidepanel a').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('body')).not.toHaveClass(/is-locked/);
});

test('phone: a nav link in the sheet navigates', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the sheet only exists under 900px');
  await page.goto('/');
  await page.locator('.side__menuBtn').click();
  await page.locator('#sidepanel a[href="/articles"]').first().click();
  await expect(page).toHaveURL(/\/articles\/?$/);
});

test('switching palette repaints the pen scene without a reload', async ({ page }) => {
  await page.goto('/articles');
  const accentPixels = () => page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('canvas.pen')!;
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let amber = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 40 && d[i] > 220 && d[i + 1] > 140 && d[i + 1] < 200 && d[i + 2] < 110) amber++;
    return amber;
  });
  await page.waitForTimeout(500);
  expect(await accentPixels()).toBe(0);           /* ember: the bookmark is red */
  await page.evaluate(() => {
    const el = document.querySelector<HTMLInputElement | HTMLSelectElement>('#tweaks [name="palette"][value="alley"], #tweaks select[name="palette"]')!;
    if (el instanceof HTMLSelectElement) el.value = 'alley'; else el.checked = true;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect.poll(accentPixels, { timeout: 5000 }).toBeGreaterThan(20);   /* alley: #F5A742 */
});
