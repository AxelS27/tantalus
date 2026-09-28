import { expect, test } from '@playwright/test';

test('home loads only its artwork and does not download music before interaction', async ({ page }) => {
  const mediaRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('media.liemaxels.com')) mediaRequests.push(request.url());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Farrell Axel Suwandi' })).toBeVisible();
  await page.waitForTimeout(600);

  expect(mediaRequests.filter((url) => url.includes('/music/'))).toEqual([]);
  expect(mediaRequests.filter((url) => url.includes('/images/tantalize/')).every((url) => /\/home(?:-\d+)?\.webp/.test(url))).toBe(true);
  await expect(page.locator('.spatial-section img')).toHaveCount(1);
});

test('canvas navigation and direct section links render their destination', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Timeline', exact: true }).click();
  await expect(page).toHaveURL(/#timeline$/);
  await expect(page.locator('img[alt="Timeline Background"]')).toBeVisible();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page).toHaveURL(/#projects$/);
  await expect(page.locator('img[alt="Projects Background"]')).toBeVisible();
  const cardImage = page.locator('img[src*="/images/thumbnails/projects/"]').first();
  await expect(cardImage).toBeVisible();

  await page.goto('/#watchlist');
  await expect(page.locator('img[alt="Watchlist theater background"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Watchlist' })).toBeVisible();
});

test('project deep link and robots file work on the production preview', async ({ page, request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('User-agent: *');

  await page.goto('/projects/phylaxify');
  await expect(page.getByText('Phylaxify: AI Powered Donation Filter', { exact: true }).first()).toBeVisible();
  await expect(page.locator('img[src*="project-detail-bg"]')).toBeVisible();
});
