import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { createTestAppWithSession } from '../helpers/test-app.mjs';
import { createFetchRequest } from '../../dist/index.js';

// Run against an isolated in-memory database; never changes the live database.
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE).href);
const { app, db, sessionCookie } = createTestAppWithSession();
const kitchen = db.prepare('INSERT INTO mbg_kitchens (name, code, address, village, district, city, province, postal_code, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run('Dummy Kitchen', 'DUMMY-001', 'Test Street', 'Village', 'District', 'City', 'Province', '12345', 100);
const kitchenId = Number(kitchen.lastInsertRowid);
const school = db.prepare('INSERT INTO schools (kitchen_id, name, npsn, address, village, district, city, province, postal_code, student_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(kitchenId, 'Dummy School', '10000001', 'School Street', 'Village', 'District', 'City', 'Province', '12345', 25);
const schoolId = Number(school.lastInsertRowid);
const server = createServer(async (req, res) => {
  const response = await app.fetch(createFetchRequest(req, new URL(req.url, 'http://127.0.0.1')));
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(await response.text());
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await context.addCookies([{ name: 'mbg_session', value: sessionCookie.split('=')[1], url: origin }]);
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  async function fill(formId, fields) {
    for (const [name, value] of Object.entries(fields)) {
      await page.locator(`#${formId} [name="${name}"]`).fill(value);
    }
  }
  async function save(formId, method, path) {
    const response = page.waitForResponse(r => r.request().method() === method && new URL(r.url()).pathname === path);
    await page.locator(`#${formId} button[type="submit"], #${formId} button:not([type])`).click();
    const result = await response;
    assert.equal(result.ok(), true, await result.text());
  }
  await page.goto(`${origin}/admin`);
  await page.locator('#dashboard-income').waitFor();
  await page.waitForFunction(() => document.getElementById('dashboard-income').textContent === 'Rp0');
  await page.locator('#dashboard-report-rows').getByText('Belum ada laporan.').waitFor();
  console.log('Admin dashboard cards and report empty state load from live APIs.');
  await page.goto(`${origin}/admin/menu`);
  await page.getByRole('button', { name: 'Tambah Menu' }).click();
  assert.equal(await page.locator('#menu-modal').isVisible(), true);
  console.log('Menu add button opens the form. Kitchen option count:', await page.locator('#menu-kitchen option').count());
  await page.goto(`${origin}/admin/lokasi`);
  await page.locator('#kitchen-rows').getByText('Dummy Kitchen', { exact: true }).waitFor();
  await page.locator('#school-rows').getByText('Dummy School', { exact: true }).waitFor();
  assert.equal(await page.locator('form').count(), 1);
  assert.equal(await page.getByRole('button', { name: 'Edit', exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Hapus', exact: true }).count(), 0);
  console.log('Dapur and school data is read-only and loaded from the dummy API source.');

  await page.goto(`${origin}/admin/menu`);
  await page.getByRole('button', { name: 'Tambah Menu' }).click();
  await fill('menu-form', { name: 'Browser Lunch', menu_date: '2026-08-30', calories: '500' });
  await page.locator('#menu-kitchen').selectOption(String(kitchenId));
  await page.locator('#menu-school').selectOption(String(schoolId));
  await fill('menu-form', { name: '   ' });
  const rejected = page.waitForResponse(r => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/admin/menus');
  await page.locator('#menu-form button[type=submit]').click();
  assert.equal((await rejected).status(), 400);
  await page.locator('#menu-modal').getByRole('alert').getByText('Nama menu wajib diisi.').waitFor();
  assert.equal(await page.locator('#menu-modal').isVisible(), true);
  await fill('menu-form', { name: 'Browser Lunch' });
  if (process.env.CRUD_SCREENSHOTS) {
    await page.screenshot({ path: join(process.env.CRUD_SCREENSHOTS, 'crud-menu-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: join(process.env.CRUD_SCREENSHOTS, 'crud-menu-mobile.png'), fullPage: true });
    await page.setViewportSize({ width: 1366, height: 900 });
  }
  await save('menu-form', 'POST', '/api/admin/menus');
  await page.locator('#menu-rows').getByText('Browser Lunch', { exact: true }).waitFor();
  await page.locator('#menu-rows').getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('#menu-modal').waitFor({ state: 'visible' });
  await fill('menu-form', { name: 'Browser Lunch Updated' });
  await save('menu-form', 'PATCH', '/api/admin/menus/1');
  await page.reload();
  await page.locator('#menu-rows').getByText('Browser Lunch Updated', { exact: true }).waitFor();
  console.log('Menu create/edit persisted after browser reload.');

  await page.goto(`${origin}/admin/keuangan`);
  await page.getByRole('button', { name: 'Tambah Transaksi' }).click();
  await fill('finance-form', { title: 'Browser Purchase', category: 'Ingredients', amount: '1000', transaction_date: '2026-08-30' });
  await page.locator('#finance-kitchen').selectOption(String(kitchenId));
  await save('finance-form', 'POST', '/api/admin/finance/transactions');
  await page.locator('#finance-rows').getByText('Browser Purchase', { exact: true }).waitFor();
  await page.locator('#finance-rows').getByRole('button', { name: 'Edit', exact: true }).click();
  await page.locator('#finance-modal').waitFor({ state: 'visible' });
  await fill('finance-form', { title: 'Browser Purchase Updated', amount: '1200' });
  await save('finance-form', 'PATCH', '/api/admin/finance/transactions/1');
  await page.reload();
  await page.locator('#finance-rows').getByText('Browser Purchase Updated', { exact: true }).waitFor();
  console.log('Finance create/edit persisted after browser reload.');
  await page.goto(`${origin}/admin/keuangan/statistik`);
  await page.locator('#stats-chart > div').first().waitFor();
  assert.equal(await page.locator('#stats-chart > div').count(), 12);
  await page.locator('#stats-year').fill('2025');
  await page.locator('#stats-year').press('Tab');
  await page.waitForFunction(() => document.getElementById('stats-income').textContent === 'Rp 0');
  if (process.env.CRUD_SCREENSHOTS) await page.screenshot({ path: join(process.env.CRUD_SCREENSHOTS, 'crud-statistics-desktop.png'), fullPage: true });
  console.log('Statistics chart, year filter, and empty period state load correctly.');

  const aspirationResponse = await app.request('/api/aspirations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ sender_name: 'Browser Parent', category: 'Menu', description: 'Please improve the vegetables.' }) });
  assert.equal(aspirationResponse.status, 201);
  await page.goto(`${origin}/admin/aspirasi`);
  await page.getByRole('button', { name: 'Detail / Tanggapi' }).click();
  await page.locator('#aspiration-modal').waitFor({ state: 'visible' });
  await page.locator('#aspiration-form [name=status]').selectOption('in_progress');
  await save('aspiration-form', 'PATCH', '/api/admin/aspirations/1');
  await page.reload();
  await page.locator('#aspiration-rows').getByText('in_progress', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Detail / Tanggapi' }).click();
  await page.locator('#aspiration-modal').waitFor({ state: 'visible' });
  await fill('aspiration-form', { admin_response: 'We have updated the menu.' });
  await page.locator('#aspiration-form [name=status]').selectOption('completed');
  await save('aspiration-form', 'PATCH', '/api/admin/aspirations/1');
  assert.equal(db.prepare('SELECT admin_response FROM aspirations WHERE id = 1').get().admin_response, 'We have updated the menu.');
  console.log('Aspiration status-only update and response passed through the browser.');
  for (const [path, rows] of [['/admin/menu', 'menu-rows'], ['/admin/keuangan', 'finance-rows']]) {
    await page.goto(origin + path);
    await page.locator(`#${rows}`).getByRole('button', { name: 'Hapus', exact: true }).click();
    await page.waitForFunction(id => !document.querySelector(`#${id} button`), rows);
  }
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM menus').get().count, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM financial_transactions').get().count, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM schools').get().count, 1);
  assert.equal(db.prepare('SELECT COUNT(*) AS count FROM mbg_kitchens').get().count, 1);
  assert.deepEqual(errors, []);
  console.log('All four delete flows passed; no browser script errors.');
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  db.close();
}
