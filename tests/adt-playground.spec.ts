import { test, expect, type Locator, type Page } from '@playwright/test';

/* The three figures in /articles/containers-stacks-queues-deques (AdtPlayground.tsx). Their buttons
   are the rows of the article's ADT tables, so these tests read the way the tables do. */

type Kind = 'stack' | 'queue' | 'deque';

async function openFigure(page: Page, kind: Kind) {
  await page.goto('/articles/containers-stacks-queues-deques');
  const fig = page.locator(`[data-adt="${kind}"]`);
  await fig.scrollIntoViewIfNeeded();
  // client:visible hydrates on scroll; an astro-island drops its `ssr` attribute once it
  // has. Only this figure's island: the others may still be below the fold, unhydrated.
  await expect(page.locator('astro-island[ssr]', { has: fig })).toHaveCount(0);
  const call = (name: string) => fig.getByRole('button', { name, exact: true }).click();
  return { fig, call, cells: fig.getByRole('listitem'), lastCall: fig.getByRole('log').locator('> div').last() };
}

const left = async (cell: Locator) => (await cell.boundingBox())!.x;

test('stack figure: the last item in is the first one out', async ({ page }) => {
  const { call, cells, lastCall } = await openFigure(page, 'stack');
  await expect(cells).toHaveText(['1', '2', '3 top']);
  await call('push');
  await expect(lastCall).toHaveText('push(4)');
  await expect(cells).toHaveText(['1', '2', '3', '4 top']);
  await call('top()');
  await expect(lastCall).toHaveText('top() → 4');
  await expect(cells).toHaveCount(4);              /* top looks, it does not take */
  await call('pop()');
  await expect(lastCall).toHaveText('pop() // removed 4');
  await call('pop()');
  await call('top()');
  await expect(lastCall).toHaveText('top() → 2');
  await call('size()');
  await expect(lastCall).toHaveText('size() → 2');
});

test('stack figure: pop and top on an empty stack are refused', async ({ page }) => {
  const { call, cells, lastCall } = await openFigure(page, 'stack');
  for (let i = 0; i < 3; i++) await call('pop()');
  await expect(cells).toHaveText(['empty']);
  await call('isEmpty()');
  await expect(lastCall).toHaveText('isEmpty() → true');
  for (const name of ['pop()', 'top()']) {
    await call(name);
    await expect(lastCall).toHaveText(`${name} ✗ requires stack not empty`);
  }
  await expect(cells).toHaveText(['empty']);
});

test('stack figure: a typed value is pushed on Enter, the figure stops at five, reset starts over', async ({ page }) => {
  const { fig, call, cells, lastCall } = await openFigure(page, 'stack');
  const value = fig.getByRole('textbox');
  await expect(value).toHaveValue('4');
  await value.fill('cat');
  await value.press('Enter');
  await expect(cells.last()).toHaveText('cat top');
  await expect(value).toHaveValue('5');
  await call('push');
  await expect(cells).toHaveCount(5);
  await call('push');
  await expect(lastCall).toHaveText('push(6) ✗ this figure stops at 5');
  await expect(cells).toHaveCount(5);
  await call('reset');
  await expect(cells).toHaveText(['1', '2', '3 top']);
});

test('queue figure: the first item in is the first one out', async ({ page }) => {
  const { call, cells, lastCall } = await openFigure(page, 'queue');
  await expect(cells).toHaveText(['1 front', '2', '3 back']);
  await call('push');
  await expect(lastCall).toHaveText('push(4)');
  await expect(cells).toHaveText(['1 front', '2', '3', '4 back']); /* push joins at the back... */
  await call('front()');
  await expect(lastCall).toHaveText('front() → 1');
  await expect(cells).toHaveCount(4);
  await call('pop()');
  await expect(lastCall).toHaveText('pop() // removed 1');          /* ...and pop leaves from the front */
  await expect(cells).toHaveText(['2 front', '3', '4 back']);
  await call('pop()');
  await call('front()');
  await expect(lastCall).toHaveText('front() → 3');
  await call('size()');
  await expect(lastCall).toHaveText('size() → 2');
});

test('queue figure: drawn left to right, the back on the left and the front on the right', async ({ page }) => {
  const { cells } = await openFigure(page, 'queue');
  await expect(cells).toHaveText(['1 front', '2', '3 back']);
  expect(await left(cells.first())).toBeGreaterThan(await left(cells.last()));
});

test('queue figure: pop and front on an empty queue are refused', async ({ page }) => {
  const { call, cells, lastCall } = await openFigure(page, 'queue');
  for (let i = 0; i < 3; i++) await call('pop()');
  await expect(cells).toHaveText(['empty']);
  await call('isEmpty()');
  await expect(lastCall).toHaveText('isEmpty() → true');
  for (const name of ['pop()', 'front()']) {
    await call(name);
    await expect(lastCall).toHaveText(`${name} ✗ requires queue not empty`);
  }
  await expect(cells).toHaveText(['empty']);
});

test('deque figure: both ends are open', async ({ page }) => {
  const { fig, call, cells, lastCall } = await openFigure(page, 'deque');
  await expect(cells).toHaveText(['1 front', '2', '3 back']);
  await call('push_front');
  await expect(lastCall).toHaveText('push_front(4)');
  await expect(cells).toHaveText(['4 front', '1', '2', '3 back']);
  expect(await left(cells.first())).toBeGreaterThan(await left(cells.last())); /* front on the right, as for the queue */
  await fig.getByRole('textbox', { name: 'value to push_back' }).fill('cat');
  await call('push_back');
  await expect(lastCall).toHaveText('push_back(cat)');
  await expect(cells).toHaveText(['4 front', '1', '2', '3', 'cat back']);
  await call('back()');
  await expect(lastCall).toHaveText('back() → cat');
  await call('front()');
  await expect(lastCall).toHaveText('front() → 4');
  await call('pop_back()');
  await expect(lastCall).toHaveText('pop_back() // removed cat');
  await call('pop_front()');
  await expect(lastCall).toHaveText('pop_front() // removed 4');
  await expect(cells).toHaveText(['1 front', '2', '3 back']);
  await call('size()');
  await expect(lastCall).toHaveText('size() → 3');
});

test('deque figure: a lone item is both front and back, and an empty deque refuses both pops', async ({ page }) => {
  const { call, cells, lastCall } = await openFigure(page, 'deque');
  await call('pop_front()');
  await call('pop_back()');
  await expect(cells).toHaveText(['2 front & back']);
  await call('pop_back()');
  await expect(cells).toHaveText(['empty']);
  for (const name of ['pop_front()', 'pop_back()', 'front()', 'back()']) {
    await call(name);
    await expect(lastCall).toHaveText(`${name} ✗ requires deque not empty`);
  }
});
