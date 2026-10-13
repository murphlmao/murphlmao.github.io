import { test, expect, type Page } from '@playwright/test';

/* The true-or-false quiz (Quiz.tsx), as placed under the deque figure in
   /articles/stacks-queues-deques. Any article can carry one. */

async function openQuiz(page: Page) {
  await page.goto('/articles/stacks-queues-deques');
  const quiz = page.locator('[data-quiz]').first();
  await quiz.scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[ssr]', { has: quiz })).toHaveCount(0); /* client:visible has hydrated */
  const pick = (name: string) => quiz.getByRole('button', { name, exact: true }).click();
  return { quiz, pick, verdict: quiz.getByRole('status') };
}

test('quiz: a wrong pick says nope and keeps the why to itself', async ({ page }) => {
  const { quiz, pick, verdict } = await openQuiz(page);
  await expect(quiz).toContainText('Stacks and queues are sequence containers.');
  await expect(verdict).toBeEmpty();
  await pick('true');
  await expect(verdict).toHaveText('nope.');
  await expect(quiz).not.toContainText('container adapters');
  await expect(quiz.getByRole('button', { name: 'false', exact: true })).toBeEnabled(); /* you get another go */
});

test('quiz: the right pick says yep, shows the why, and again starts over', async ({ page }) => {
  const { quiz, pick, verdict } = await openQuiz(page);
  await pick('false');
  await expect(verdict).toContainText('yep.');
  await expect(verdict).toContainText('container adapters');
  await expect(quiz.getByRole('button', { name: 'true', exact: true })).toBeDisabled(); /* solved: only again is live */
  await pick('again');
  await expect(verdict).toBeEmpty();
  await expect(quiz.getByRole('button', { name: 'true', exact: true })).toBeEnabled();
});
