import { test, expect } from '@playwright/test';

/* /articles keeps the address bar shareable: the view lives in ?view=, the open course in #hash. */

test('articles: switching view and opening a course write ?view= and #course to the URL', async ({ page }) => {
  await page.goto('/articles');
  await page.getByRole('radio', { name: 'by class' }).click();
  await expect(page).toHaveURL(/\?view=class$/);

  const course = page.locator('details.course').first();
  const id = await course.getAttribute('id');
  await course.locator('summary').click();
  await expect(page).toHaveURL(new RegExp(`\\?view=class#${id}$`));

  await course.locator('summary').click(); /* closing clears the hash */
  await expect(page).toHaveURL(/\?view=class$/);

  await course.locator('summary').click();
  await page.getByRole('radio', { name: 'by date' }).click();
  await expect(page).toHaveURL(/\?view=date$/);
});

test('articles: a shared link opens that course and scrolls to it, overriding a saved view', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('articlesView', 'date'));
  await page.goto('/articles?view=class#eecs281');
  const course = page.locator('details#eecs281');
  await expect(course).toHaveAttribute('open', '');
  await expect(course).toBeInViewport();
  await expect(page.locator('#flat')).toBeHidden();
});
