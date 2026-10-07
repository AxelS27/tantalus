import { devices, expect, test } from '@playwright/test';

test.use({
  viewport: devices['Pixel 7'].viewport,
  deviceScaleFactor: devices['Pixel 7'].deviceScaleFactor,
  isMobile: true,
  hasTouch: true,
});

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('tantalize_theme_entrance_v1', 'seen'));
});

async function swipeUp(page: import('@playwright/test').Page, x: number, fromY: number, toY: number) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: fromY }] });
  for (let step = 1; step <= 12; step++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: fromY + (toY - fromY) * step / 12 }],
    });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

test('mobile dock switches a single viewport without moving a giant canvas, and gallery swipes scroll', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect(page.locator('img[alt="Projects Background"]')).toBeVisible();
  const world = page.locator('.canvas-quality-balanced, .canvas-quality-reduced');
  await expect(world).toHaveCSS('transform', 'none');
  await expect(page.locator('.spatial-section:visible')).toHaveCount(1);

  const gallery = page.locator('.archive-gallery-scroll-container').first();
  await expect(gallery.locator('a[href="/projects/phylaxify"]')).toBeVisible();
  await swipeUp(page, 165, 650, 230);
  await expect.poll(() => gallery.evaluate((element) => element.scrollTop)).toBeGreaterThan(100);
  const previousScrollTop = await gallery.evaluate((element) => element.scrollTop);
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await page.getByRole('button', { name: 'Projects', exact: true }).click();
  await expect.poll(() => gallery.evaluate((element) => element.scrollTop)).toBeGreaterThanOrEqual(previousScrollTop);

  await page.locator('.archive-gallery-scroll-container a[href="/projects/phylaxify"]').click();
  const detail = page.locator('.project-detail-scroll-container');
  await expect(detail.getByRole('heading', { name: /Phylaxify/ })).toBeVisible();
  await expect(detail.locator('article')).toHaveCSS('backdrop-filter', 'none');
  await swipeUp(page, 190, 650, 230);
  await expect.poll(() => detail.evaluate((element) => element.scrollTop)).toBeGreaterThan(100);
});
