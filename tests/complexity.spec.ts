import { test, expect } from '@playwright/test';

/* /articles/complexity-analysis: inline LaTeX ($O(\log n)$) rendered by KaTeX, and the
   "growth of the common orders" figure (BigOGraph.tsx). */

test('complexity: inline math renders with KaTeX instead of showing dollar signs', async ({ page }) => {
  await page.goto('/articles/complexity-analysis');
  const math = page.locator('.prose .katex');
  expect(await math.count()).toBeGreaterThan(5); /* the orders-of-growth table alone has nine */
  await expect(page.locator('.prose')).not.toContainText('$O(');
});

test('complexity: the growth figure draws nine orders, a legend click hides one, and log scale shows powers of ten', async ({ page }) => {
  await page.goto('/articles/complexity-analysis');
  const fig = page.locator('[data-fig="big-o"]');
  await fig.scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[ssr]', { has: fig })).toHaveCount(0);
  await expect(fig.locator('.recharts-line')).toHaveCount(9);
  await fig.getByRole('button', { name: 'O(n!)', exact: true }).click();
  await expect(fig.locator('.recharts-line')).toHaveCount(8);
  await fig.getByRole('button', { name: 'O(n!)', exact: true }).click();
  await expect(fig.locator('.recharts-line')).toHaveCount(9);
  await fig.getByRole('button', { name: 'log scale', exact: true }).click();
  await expect(fig.locator('.recharts-yAxis-tick-labels')).toContainText('10²⁰'); /* Recharts 3 draws labels in their own layer */
});

test('complexity: the 100n vs n² figure opens on the table, and the graph tab marks where they are equal', async ({ page }) => {
  await page.goto('/articles/complexity-analysis');
  const fig = page.locator('[data-fig="constants-crossover"]');
  await fig.scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[ssr]', { has: fig })).toHaveCount(0);
  await expect(fig.getByRole('button', { name: 'table', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(fig.locator('tbody tr')).toHaveCount(4);
  await expect(fig.locator('.recharts-line')).toHaveCount(0);
  await fig.getByRole('button', { name: 'graph', exact: true }).click();
  await expect(fig.locator('table')).toHaveCount(0);
  await expect(fig.locator('.recharts-line')).toHaveCount(2);
  await expect(fig).toContainText('equal at n = 100');
  await fig.getByRole('button', { name: 'table', exact: true }).click();
  await expect(fig.locator('tbody tr')).toHaveCount(4);
});
