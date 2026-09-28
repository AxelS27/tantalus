import { devices, expect, test } from '@playwright/test';

test('home mounts canvas artworks eagerly and does not download music before interaction', async ({ page }) => {
  const mediaRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('media.liemaxels.com')) mediaRequests.push(request.url());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Farrell Axel Suwandi' })).toBeVisible();
  await page.waitForTimeout(600);

  expect(mediaRequests.filter((url) => url.includes('/music/'))).toEqual([]);
  await expect(page.locator('img[alt="Home Background"]')).toBeVisible();
  await expect(page.locator('img[alt="Timeline Background"]')).toBeAttached();
  await expect(page.locator('img[alt="Projects Background"]')).toBeAttached();
});

test('navbar hover subtle highlight works consistently on every inactive tab', async ({ page }) => {
  await page.goto('/#timeline');
  for (const label of ['Home', 'Projects', 'Archive']) {
    const button = page.getByRole('button', { name: label, exact: true });
    await button.hover();
    await expect(button.locator('div.bg-white\\/25')).toBeVisible();
  }
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  const timeline = page.getByRole('button', { name: 'Timeline', exact: true });
  await timeline.hover();
  await expect(timeline.locator('div.bg-white\\/25')).toBeVisible();
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

  const response = await request.get('/projects/phylaxify');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).toContain('<title>AxelS27 - Phylaxify: AI Powered Donation Filter</title>');
  expect(html).toContain('property="og:image" content="https://media.liemaxels.com/projects/phylaxify/');
  expect(html).toContain('rel="canonical" href="https://www.liemaxels.com/projects/phylaxify"');
  expect(html).not.toContain('rel="preload" as="image"');
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain('https://www.liemaxels.com/projects/phylaxify');
  const artworkRequests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/images/tantalize/home')) artworkRequests.push(request.url());
  });
  await page.goto('/projects/phylaxify');
  await expect(page.getByText('Phylaxify: AI Powered Donation Filter', { exact: true }).first()).toBeVisible();
  expect(artworkRequests).toEqual([]);
  await expect(page.locator('img[src*="project-detail-bg"]')).toBeVisible();
});

test('recovers from one stale lazy chunk request without a reload loop', async ({ page }) => {
  let documentRequests = 0;
  let failedChunks = 0;
  page.on('request', (request) => {
    if (request.isNavigationRequest()) documentRequests++;
  });
  await page.route('**/assets/StoryBook-*.js', async (route) => {
    if (failedChunks++ === 0) await route.fulfill({ status: 404, body: 'stale deployment' });
    else await route.continue();
  });
  await page.goto('/#storybook');
  await expect.poll(() => documentRequests).toBe(2);
  await expect(page.locator('img[alt="Story Book Background"]')).toBeVisible();
});

test.describe('mobile journey', () => {
  test.use({ viewport: devices['Pixel 7'].viewport, deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor, isMobile: true, hasTouch: true });

  test('navigates key sections and project detail without client errors', async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Farrell Axel Suwandi' })).toBeVisible();
    const navigationTimings: Record<string, number> = {};
    for (const section of ['Timeline', 'Projects']) {
      const start = Date.now();
      await page.getByRole('button', { name: section, exact: true }).click();
      await expect(page.locator(`img[alt="${section} Background"]`)).toBeVisible();
      navigationTimings[section] = Date.now() - start;
    }
    const start = Date.now();
    await page.locator('a[href="/projects/phylaxify"]').click();
    await expect(page.getByText('Phylaxify: AI Powered Donation Filter', { exact: true }).first()).toBeVisible();
    navigationTimings.projectDetail = Date.now() - start;
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.liemaxels.com/projects/phylaxify');
    await expect(page.locator('#project-jsonld')).toHaveCount(1);
    await page.goto('/#storybook');
    await expect(page.locator('img[alt="Story Book Background"]')).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.liemaxels.com/');
    await expect(page.locator('#project-jsonld')).toHaveCount(0);
    const timings = await page.evaluate(() => ({
      navigation: performance.getEntriesByType('navigation').map((entry) => ({
        duration: Math.round(entry.duration),
        transferSize: (entry as PerformanceNavigationTiming).transferSize,
      })),
      resources: performance.getEntriesByType('resource').length,
    }));
    await testInfo.attach('mobile-journey.json', { body: JSON.stringify({ navigationTimings, ...timings }), contentType: 'application/json' });
    expect(errors).toEqual([]);
  });
});
