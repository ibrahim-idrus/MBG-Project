import { test, expect } from '@playwright/test';

async function pickKitchen(page) {
  await page.goto('/cek-mbg');
  await page.locator('#btn-deny-location').click();
  await page.locator('#select-province').selectOption('DKI Jakarta');
  await page.locator('#select-city').selectOption('Jakarta Pusat');
  await page.locator('#select-district').selectOption('Gambir');
  await page.locator('#select-village').selectOption('Gambir');
  await page.locator('#story-next').click();
  await expect(page.locator('#story-step-sppg-result')).toBeVisible();
  await expect(page.locator('#story-next')).toBeEnabled();
}

test('standalone report is full screen with no dashboard chrome or horizontal overflow', async ({ page }) => {
  await page.goto('/cek-mbg');
  await expect(page.locator('aside')).toHaveCount(0);
  await expect(page.locator('#cek-mbg-story')).toBeVisible();
  await expect(page.getByRole('progressbar')).toBeVisible();
  const size = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.width);
  await expect(page.locator('#btn-allow-location')).toBeInViewport();
});

test('manual selection leads through four chapters, back navigation, summary, and selected kitchen exit', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await pickKitchen(page);
  await page.locator('#story-next').click();
  await expect(page.locator('#story-step-insight-1')).toBeVisible();
  await page.locator('#story-next').click();
  await expect(page.locator('#story-step-insight-2')).toBeVisible();
  await page.locator('#story-back').click();
  await expect(page.locator('#story-step-insight-1')).toBeVisible();
  for (const next of ['insight-2', 'insight-3', 'insight-4', 'insight-summary']) {
    await page.locator('#story-next').click();
    await expect(page.locator('#story-step-' + next)).toBeVisible();
    await expect(page.locator('#story-next')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
  await expect(page.locator('#story-step-insight-summary')).toContainText('Data demo');
  await page.locator('#story-next').click();
  await expect(page).toHaveURL(/\/lokasi\?kitchen_id=\d+&highlight=true/);
  expect(errors).toEqual([]);
});

test('denied geolocation uses manual choice, never an unrelated fallback location', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = (_success, error) => error({ code: 1 });
  });
  let lookups = 0;
  page.on('request', req => { if (req.url().includes('/find-sppg')) lookups++; });
  await page.goto('/cek-mbg');
  await page.locator('#btn-allow-location').click();
  await expect(page.locator('#story-step-manual-form')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('lokasi');
  expect(lookups).toBe(0);
});

test('lookup failure leaves an actionable error and preserves selected location', async ({ page }) => {
  await page.route('**/api/location/find-sppg', route => route.fulfill({ status: 404, json: { message: 'Tidak ada SPPG di wilayah ini.' } }));
  await page.goto('/cek-mbg');
  await page.locator('#btn-deny-location').click();
  for (const [id, value] of [['province', 'DKI Jakarta'], ['city', 'Jakarta Pusat'], ['district', 'Gambir'], ['village', 'Gambir']]) {
    await page.locator('#select-' + id).selectOption(value);
  }
  await page.locator('#story-next').click();
  await expect(page.getByRole('alert')).toContainText('Tidak ada SPPG');
  await expect(page.locator('#select-village')).toHaveValue('Gambir');
  await expect(page.locator('#story-next')).toBeEnabled();
});

test('direct kitchen links load the report and respect reduced motion', async ({ page, request }) => {
  const res = await request.post('/api/location/find-sppg', { data: { province: 'DKI Jakarta', city: 'Jakarta Pusat', district: 'Gambir', village: 'Gambir' } });
  const { data } = await res.json();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cek-mbg/' + data.id);
  await expect(page.locator('#sppg-card-name')).toHaveText(data.name);
  await page.locator('#story-next').click();
  await expect(page.locator('#story-step-insight-1')).toBeVisible();
  expect(await page.locator('#story-step-insight-1').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});

test('hierarchy can recover from a failed request', async ({ page }) => {
  let failed = false;
  await page.route('**/api/location/hierarchy', route => {
    if (!failed) { failed = true; return route.fulfill({ status: 503, json: {} }); }
    return route.continue();
  });
  await page.goto('/cek-mbg');
  await page.locator('#btn-deny-location').click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('#story-next')).toBeDisabled();
  await page.locator('#story-retry').click();
  await expect(page.locator('#select-province')).toBeEnabled();
  await expect(page.getByRole('alert')).toBeHidden();
});

test('insight errors cannot open a misleading report and can be retried', async ({ page }) => {
  let failed = false;
  await page.route('**/api/location/sppg/*/insights', route => {
    if (!failed) { failed = true; return route.fulfill({ status: 503, json: {} }); }
    return route.continue();
  });
  await page.goto('/cek-mbg');
  await page.locator('#btn-deny-location').click();
  for (const [id, value] of [['province', 'DKI Jakarta'], ['city', 'Jakarta Pusat'], ['district', 'Gambir'], ['village', 'Gambir']]) {
    await page.locator('#select-' + id).selectOption(value);
  }
  await page.locator('#story-next').click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('#story-next')).toBeDisabled();
  await page.locator('#story-retry').click();
  await expect(page.locator('#story-next')).toBeEnabled();
  await page.locator('#story-next').click();
  await expect(page.locator('#insight-finance-in')).not.toHaveText('—');
});

test('a late GPS result cannot replace the user’s manual location choice', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.geolocation.getCurrentPosition = success => { window.finishGps = success; };
  });
  let lookups = 0;
  page.on('request', req => { if (req.url().includes('/find-sppg')) lookups++; });
  await page.goto('/cek-mbg');
  await page.locator('#btn-allow-location').click();
  await page.locator('#cancel-search').click();
  await page.evaluate(() => window.finishGps({ coords: { latitude: -6.1754, longitude: 106.8272 } }));
  await expect(page.locator('#story-step-manual-form')).toBeVisible();
  expect(lookups).toBe(0);
});

test('summary tiles revisit a chapter and return to the completed report', async ({ page }) => {
  await pickKitchen(page);
  for (let i = 0; i < 5; i++) await page.locator('#story-next').click();
  await expect(page.getByRole('button', { name: 'Baca ulang cerita anggaran' })).toHaveAccessibleDescription('100%');
  if (page.viewportSize().width === 390) {
    const tile = await page.getByRole('button', { name: 'Baca ulang cerita keamanan' }).boundingBox();
    const footer = await page.locator('.story-footer').boundingBox();
    expect(tile.y + tile.height).toBeLessThanOrEqual(footer.y);
  }
  await page.getByRole('button', { name: 'Baca ulang cerita gizi' }).click();
  await expect(page.locator('#story-step-insight-2')).toBeVisible();
  await page.getByText('Intip menu & kandungan gizi', { exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#nutrition-menu')).toBeVisible();
  await page.locator('#story-next').click();
  await expect(page.locator('#story-step-insight-summary')).toBeVisible();
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '4');
});

test('unknown kitchen links recover to location selection', async ({ page }) => {
  await page.goto('/cek-mbg/999999');
  await expect(page.locator('#story-step-manual-form')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Tidak ada SPPG');
});
