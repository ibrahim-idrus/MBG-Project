import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestAppWithSession } from '../helpers/test-app.mjs';

test('admin menu page includes a live API-backed CRUD controller', async () => {
  const { app, sessionCookie } = createTestAppWithSession();
  const response = await app.request('/admin/menu', { headers: { cookie: sessionCookie } });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /api\/admin\/menus/);
  assert.match(html, /fetch\(/);
  assert.match(html, /Simpan Menu/);
});

test('admin finance and aspiration pages include live API controllers', async () => {
  const { app, sessionCookie } = createTestAppWithSession();
  const finance = await app.request('/admin/keuangan', { headers: { cookie: sessionCookie } });
  const financeHtml = await finance.text();
  assert.match(financeHtml, /api\/admin\/finance\/transactions/);
  assert.match(financeHtml, /api\/admin\/finance\/statistics/);

  const aspirations = await app.request('/admin/aspirasi', { headers: { cookie: sessionCookie } });
  const aspirationsHtml = await aspirations.text();
  assert.match(aspirationsHtml, /api\/admin\/aspirations/);
  assert.match(aspirationsHtml, /admin_response/);
});

test('authenticated location page exposes kitchen and school master-data APIs', async () => {
  const { app, sessionCookie } = createTestAppWithSession();
  const response = await app.request('/admin/lokasi', { headers: { cookie: sessionCookie } });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /api\/admin\/kitchens/);
  assert.match(html, /api\/admin\/schools/);
});
