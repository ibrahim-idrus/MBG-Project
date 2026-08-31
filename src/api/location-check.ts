import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { readJson, pathId, validationResponse } from './common.js';
import {
  getLocationHierarchy,
  findKitchenByLocation,
  findNearestKitchen,
  getKitchenInsightMetrics,
} from '../db/queries.js';

export function registerLocationCheckRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  // 1. Get Administrative Region Hierarchy
  app.get('/api/location/hierarchy', (c) => {
    const hierarchy = getLocationHierarchy(db);
    return c.json({ data: hierarchy });
  });

  // 2. Find SPPG by location or coordinates
  app.post('/api/location/find-sppg', async (c) => {
    const body = (await readJson(c)) || {};
    const lat = typeof body.lat === 'number' ? body.lat : typeof body.lat === 'string' ? parseFloat(body.lat) : null;
    const lng = typeof body.lng === 'number' ? body.lng : typeof body.lng === 'string' ? parseFloat(body.lng) : null;

    if (lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng)) {
      const nearest = findNearestKitchen(lat, lng, db);
      if (!nearest) {
        return c.json({ message: 'Tidak ada SPPG aktif ditemukan di dekat lokasi ini.' }, 404);
      }
      return c.json({ data: nearest });
    }

    const province = typeof body.province === 'string' ? body.province.trim() : '';
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const district = typeof body.district === 'string' ? body.district.trim() : '';
    const village = typeof body.village === 'string' ? body.village.trim() : '';

    const kitchen = findKitchenByLocation({ province, city, district, village }, db);
    if (!kitchen) {
      return c.json({ message: 'Tidak ada SPPG aktif ditemukan untuk wilayah ini.' }, 404);
    }

    return c.json({
      data: {
        ...kitchen,
        searchedLocation: { province, city, district, village },
      },
    });
  });

  // 3. Get 4-Pillar Insight Metrics for a specific SPPG
  app.get('/api/location/sppg/:id/insights', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) {
      return validationResponse(c, { id: 'ID SPPG tidak valid.' });
    }

    const insights = getKitchenInsightMetrics(id, db);
    if (!insights) {
      return c.json({ message: 'SPPG tidak ditemukan.' }, 404);
    }

    return c.json({ data: insights });
  });
}
