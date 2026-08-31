import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestAppWithSession } from '../helpers/test-app.mjs';
import { ensureDummyMasterData } from '../../dist/db/dummy-master-data.js';

test('location hierarchy API returns cascading provinces, cities, districts, and villages', async () => {
  const { app, db } = createTestAppWithSession();
  ensureDummyMasterData(db);

  const res = await app.request('/api/location/hierarchy');
  assert.equal(res.status, 200);

  const json = await res.json();
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 2);

  const dki = json.data.find(p => p.name === 'DKI Jakarta');
  assert.ok(dki, 'DKI Jakarta province should exist in hierarchy');
  assert.ok(dki.cities.some(c => c.name === 'Jakarta Pusat' || c.name === 'Jakarta Selatan'));

  const jabar = json.data.find(p => p.name === 'Jawa Barat');
  assert.ok(jabar, 'Jawa Barat province should exist in hierarchy');
  assert.ok(jabar.cities.some(c => c.name === 'Bandung'));
});

test('find SPPG by hierarchical location matches the correct kitchen and schools', async () => {
  const { app, db } = createTestAppWithSession();
  ensureDummyMasterData(db);

  // Test Gambir (JKT-001)
  const resGambir = await app.request('/api/location/find-sppg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      province: 'DKI Jakarta',
      city: 'Jakarta Pusat',
      district: 'Gambir',
      village: 'Gambir',
    }),
  });
  assert.equal(resGambir.status, 200);
  const jsonGambir = await resGambir.json();
  assert.equal(jsonGambir.data.code, 'JKT-001');
  assert.equal(jsonGambir.data.name, 'Dapur MBG Jakarta Pusat');
  assert.ok(jsonGambir.data.totalSchools >= 2);

  // Test Cilandak (JKT-002)
  const resCilandak = await app.request('/api/location/find-sppg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      province: 'DKI Jakarta',
      city: 'Jakarta Selatan',
      district: 'Cilandak',
      village: 'Cilandak',
    }),
  });
  assert.equal(resCilandak.status, 200);
  const jsonCilandak = await resCilandak.json();
  assert.equal(jsonCilandak.data.code, 'JKT-002');
  assert.equal(jsonCilandak.data.name, 'Dapur MBG Jakarta Selatan');

  // Test Bandung (BDG-001)
  const resBdg = await app.request('/api/location/find-sppg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      province: 'Jawa Barat',
      city: 'Bandung',
      district: 'Sumur Bandung',
      village: 'Kebon Pisang',
    }),
  });
  assert.equal(resBdg.status, 200);
  const jsonBdg = await resBdg.json();
  assert.equal(jsonBdg.data.code, 'BDG-001');
  assert.equal(jsonBdg.data.name, 'Dapur MBG Bandung Kota');
});

test('find SPPG by GPS coordinates matches nearest kitchen', async () => {
  const { app, db } = createTestAppWithSession();
  ensureDummyMasterData(db);

  // Coordinates near Monas / Gambir
  const res = await app.request('/api/location/find-sppg', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat: -6.1754, lng: 106.8272 }),
  });
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.data.code, 'JKT-001');
  assert.ok(json.data.detectedLocation);
  assert.ok(typeof json.data.distanceKm === 'number');
});

test('SPPG insights API returns complete 4 pillars matching flowchart requirements', async () => {
  const { app, db } = createTestAppWithSession();
  ensureDummyMasterData(db);

  const kitchen = db.prepare('SELECT id FROM mbg_kitchens LIMIT 1').get();
  assert.ok(kitchen, 'At least one kitchen must exist');

  const res = await app.request(`/api/location/sppg/${kitchen.id}/insights`);
  assert.equal(res.status, 200);
  const json = await res.json();
  const data = json.data;

  // Pillar 1: Corruption & Financial Consistency
  assert.ok(data.corruptionInsight, 'Pillar 1: Corruption & Finance must exist');
  assert.equal(data.corruptionInsight.riskLevel, 'clean');
  assert.equal(data.corruptionInsight.consistencyRate, 100);
  assert.ok(data.corruptionInsight.totalIn > 0);
  assert.ok(data.corruptionInsight.totalOut > 0);

  // Pillar 2: Daily Nutrition Fulfillment
  assert.ok(data.nutritionInsight, 'Pillar 2: Daily Nutrition must exist');
  assert.ok(data.nutritionInsight.fulfillmentRate >= 90);
  assert.ok(Array.isArray(data.nutritionInsight.macroNutrients));
  assert.ok(data.nutritionInsight.macroNutrients.some(m => m.name.includes('Kalori') || m.name.includes('Protein')));

  // Pillar 3: Sanitation & Cleanliness Percentage (including SLHS)
  assert.ok(data.sanitationInsight, 'Pillar 3: Sanitation must exist');
  assert.ok(data.sanitationInsight.sanitationPercentage >= 90);
  assert.ok(Array.isArray(data.sanitationInsight.checkpoints));
  assert.ok(data.sanitationInsight.checkpoints.length >= 3);

  // Pillar 4: Food Poisoning Track Record (0 Cases)
  assert.ok(data.poisoningInsight, 'Pillar 4: Food Poisoning Record must exist');
  assert.equal(data.poisoningInsight.caseCount, 0, 'Food poisoning cases must be 0');
  assert.match(data.poisoningInsight.status, /0 Kasus Keracunan/);
  assert.ok(data.poisoningInsight.sampleRetention);
});

test('user lokasi page renders Cek MBG button, guided modal, and all flowchart steps', async () => {
  const { app, db } = createTestAppWithSession();
  ensureDummyMasterData(db);

  const res = await app.request('/lokasi');
  assert.equal(res.status, 200);
  const html = await res.text();

  // 1. Entry button
  assert.match(html, /Cek MBG Sekarang/);
  assert.match(html, /btn-trigger-cek-mbg/);

  // 2. Geolocation permission dialog (Allow location access?)
  assert.match(html, /Izinkan Akses Lokasi\?/);
  assert.match(html, /btn-allow-location/);
  assert.match(html, /btn-deny-location/);

  // 3. Loading state (Find SPPG around you)
  assert.match(html, /Mencari SPPG di sekitar Anda\.\.\./);
  assert.match(html, /Find SPPG around you/);

  // 4. Hierarchical manual form (Provinsi, Kabupaten/Kota, Kecamatan, Kelurahan)
  assert.match(html, /select-province/);
  assert.match(html, /select-city/);
  assert.match(html, /select-district/);
  assert.match(html, /select-village/);

  // 5. SPPG card & Skip insights decision
  assert.match(html, /btn-proceed-insights/);
  assert.match(html, /btn-skip-insights/);
  assert.match(html, /Lewati Insight/);

  // 6. The 4 Sequential Insights
  assert.match(html, /Konsistensi Pemasukan vs Pengeluaran/);
  assert.match(html, /Kandungan Gizi Keseharian yang Didistribusikan/);
  assert.match(html, /Persentase Sanitasi (?:&|&amp;) Kebersihan/);
  assert.match(html, /Kasus Keracunan MBG dari SPPG Ini/);

  // 7. Finish action leading to Main Dashboard
  assert.match(html, /Buka Dashboard Utama SPPG/);
  assert.match(html, /active-sppg-filter-banner/);
});
