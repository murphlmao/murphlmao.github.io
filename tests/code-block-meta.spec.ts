import { test, expect } from '@playwright/test';

/* Words after the language on a code fence (```cpp GCC13) show in the block's header after
   a separator: "C++ | GCC13". Checked against whichever fence in the deque article carries
   a note, so the note itself can change. */

test('a code fence with words after its language shows them in the header', async ({ page }) => {
  await page.goto('/articles/containers-stacks-queues-deques');
  const header = page.locator('.code-block-lang:has(.code-block-meta)').first();
  await expect(header).toBeVisible();
  const note = (await header.locator('.code-block-meta').textContent())!.trim();
  expect(note.length).toBeGreaterThan(0);
  await expect(header).toHaveText(`C++ | ${note}`);
  // a fence with only a language is unchanged
  await expect(page.locator('.code-block-lang', { hasText: /^C\+\+$/ }).first()).toBeVisible();
});
