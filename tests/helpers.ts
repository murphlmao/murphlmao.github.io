import type { Page } from '@playwright/test';

export interface Ink { maize: number; black: number; other: number; backing: string; expected: string }

/** Classify the home pen canvas's opaque pixels, and report its backing store next to
    what computeBox() should have sized it to (CSS size x capped DPR). */
export function readInk(page: Page): Promise<Ink> {
  return page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('canvas.pen')!;
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let maize = 0, black = 0, other = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 40) continue;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r > 200 && g > 150 && b < 120) maize++;
      else if (r < 40 && g < 40 && b < 40) black++;
      else other++;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    return {
      maize, black, other,
      backing: `${c.width}x${c.height}`,
      expected: `${Math.round(c.clientWidth * dpr)}x${Math.round(c.clientHeight * dpr)}`,
    };
  });
}

/** Saved settings, as the inline head script and tweaks.ts read them. */
export function saveTweaks(page: Page, tweaks: Record<string, unknown>): Promise<unknown> {
  return page.addInitScript((t) => { localStorage.setItem('tweaks', JSON.stringify(t)); }, tweaks);
}

export function faviconHref(page: Page): Promise<string> {
  return page.evaluate(() => (document.getElementById('favicon') as HTMLLinkElement).href);
}
