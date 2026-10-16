import { test, expect, type Locator, type Page } from '@playwright/test';

/* The "inside a deque" figure (DequeMemory.tsx) in /articles/containers-stacks-queues-deques: a map
   of 8 pointers down the left, blocks of 4 cells to the right. Rows are map slots. */

async function openFigure(page: Page) {
  await page.goto('/articles/containers-stacks-queues-deques');
  const fig = page.locator('[data-fig="deque-memory"]');
  await fig.scrollIntoViewIfNeeded();
  await expect(page.locator('astro-island[ssr]', { has: fig })).toHaveCount(0);
  const call = (name: string) => fig.getByRole('button', { name, exact: true }).click();
  const row = (slot: number) => fig.locator(`[data-slot="${slot}"]`);
  // the values held in a row's block, with their front / back tags, empty cells left out
  const held = (slot: number) => row(slot).locator('[data-cell]:not([data-empty])');
  const used = () => fig.locator('[data-slot][data-block]');
  return { fig, call, row, held, used, lastCall: fig.getByRole('log').locator('> div').last() };
}

const block = (r: Locator) => r.getAttribute('data-block');

test('deque memory: five items sit in two blocks in the middle of the map', async ({ page }) => {
  const { row, held, used } = await openFigure(page);
  await expect(used()).toHaveCount(2);
  await expect(row(3)).toHaveAttribute('data-block', 'a');
  await expect(row(4)).toHaveAttribute('data-block', 'b');
  await expect(held(3)).toHaveText(['1 front', '2', '3', '4']);
  await expect(held(4)).toHaveText(['5 back']);
});

test('deque memory: filling a block allocates the next one for finish, and popping back out of it frees it', async ({ page }) => {
  const { call, row, held, used, lastCall } = await openFigure(page);
  await call('push_back');
  await call('push_back');
  await expect(held(4)).toHaveText(['5', '6', '7 back']);
  await expect(used()).toHaveCount(2);
  await call('push_back');                                          /* 8 fills block b... */
  await expect(lastCall).toHaveText('push_back(8) // block b full: new block c at map[5] so finish has a cell');
  await expect(row(5)).toHaveAttribute('data-block', 'c');
  await expect(held(5)).toHaveCount(0);                              /* ...so c exists but only holds finish */
  await expect(row(5).locator('[data-cell]').first()).toHaveAttribute('data-mark', 'finish');
  await call('push_back');
  await expect(lastCall).toHaveText('push_back(9)');
  await expect(held(5)).toHaveText(['9 back']);
  await call('pop_back()');
  await expect(lastCall).toHaveText('pop_back() // removed 9');
  await call('pop_back()');
  await expect(lastCall).toHaveText('pop_back() // removed 8, block c freed'); /* finish stepped back into b */
  await expect(used()).toHaveCount(2);
  await expect(held(4)).toHaveText(['5', '6', '7 back']);
});

test('deque memory: start sits on the front, finish on the cell after the back, and both always have a cell', async ({ page }) => {
  const { fig, call, row, held, used } = await openFigure(page);
  const readout = fig.locator('[data-readout]');
  await expect(readout).toContainText('start = map[3], cell 0');
  await expect(readout).toContainText('finish = map[4], cell 1');
  await expect(row(3).locator('[data-cell]').first()).toHaveAttribute('data-mark', 'start');
  await expect(row(4).locator('[data-cell]').nth(1)).toHaveAttribute('data-mark', 'finish'); /* the empty cell after 5 */
  for (let i = 0; i < 3; i++) await call('push_back');
  await expect(readout).toContainText('finish = map[5], cell 0');
  for (let i = 0; i < 8; i++) await call('pop_front()');
  await expect(used()).toHaveCount(1);                                /* empty, but one block is kept... */
  await expect(held(5)).toHaveCount(0);
  await expect(row(5).locator('[data-cell]').first()).toHaveAttribute('data-mark', 'start & finish'); /* ...for the two to sit on */
  await expect(readout).toContainText('start = map[5], cell 0');
  await expect(readout).toContainText('finish = map[5], cell 0');
});

test('deque memory: push_front grows upward into a new block, filling it from its far end', async ({ page }) => {
  const { call, row, held, lastCall } = await openFigure(page);
  await call('push_front');
  await expect(lastCall).toHaveText('push_front(6) // block a full: new block c at map[2]');
  await expect(row(2)).toHaveAttribute('data-block', 'c');
  await expect(held(2)).toHaveText(['6 front']);
  await expect(row(2).locator('[data-cell]').last()).toHaveText('6 front'); /* the cell before block a's first */
  await call('pop_front()');
  await expect(lastCall).toHaveText('pop_front() // removed 6, block c freed');
  await expect(held(3)).toHaveText(['1 front', '2', '3', '4']);
});

test('deque memory: at(i) is two hops, a map slot and a cell', async ({ page }) => {
  const { fig, call, row, lastCall } = await openFigure(page);
  const index = fig.getByRole('textbox', { name: 'index for at' });
  await index.fill('4');
  await index.press('Enter');
  await expect(lastCall).toHaveText('at(4) → 5 // map[4], cell 0');
  await expect(row(4)).toHaveAttribute('data-hit');
  await expect(row(4).locator('[data-cell]').first()).toHaveAttribute('data-hit');
  await index.fill('9');
  await call('at');
  await expect(lastCall).toHaveText('at(9) ✗ out of range, size is 5');
});

test('deque memory: a deque that drifts to the edge of its map gets its pointers recentered', async ({ page }) => {
  const { call, row, held, used, lastCall } = await openFigure(page);
  for (let i = 0; i < 12; i++) await call('push_back');   /* 17 items, blocks a..e in map[3..7] */
  await expect(used()).toHaveCount(5);
  await expect(row(7)).toHaveAttribute('data-block', 'e');
  for (let i = 0; i < 16; i++) await call('pop_front()'); /* down to [17] in block e, alone at the bottom */
  await expect(used()).toHaveCount(1);
  await expect(held(7)).toHaveText(['17 front & back']);
  for (let i = 0; i < 2; i++) await call('push_back');
  await call('push_back');                                 /* 20 fills e; finish needs map[8]: slide, do not grow */
  await expect(lastCall).toHaveText('push_back(20) // map edge: pointers recentered, block e now at map[3]; new block f at map[4] so finish has a cell');
  await expect(row(3)).toHaveAttribute('data-block', 'e');
  await expect(held(3)).toHaveText(['17 front', '18', '19', '20 back']);
  await expect(row(4)).toHaveAttribute('data-block', 'f');
  expect(await block(row(7))).toBeNull();
  await call('push_back');
  await expect(held(4)).toHaveText(['21 back']);
});

test('deque memory: with the map more than half full there is no room to recenter, and the figure stops', async ({ page }) => {
  const { call, used, lastCall, held } = await openFigure(page);
  for (let i = 0; i < 12; i++) await call('push_front');  /* blocks in map[0..4] */
  await expect(used()).toHaveCount(5);
  await call('push_front');
  await expect(lastCall).toHaveText('push_front(18) ✗ map full: a real deque allocates a bigger map & copies its pointers across; this figure stops here');
  await expect(used()).toHaveCount(5);
  await call('reset');
  await expect(used()).toHaveCount(2);
  await expect(held(3)).toHaveText(['1 front', '2', '3', '4']);
});
