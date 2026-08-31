import type Database from 'better-sqlite3';
import { Hono } from 'hono';
import type { AuthEnv } from '../auth/middleware.js';
import { decimalValue, hasOwn, integerValue, likePattern, pagination, paginationResponse, pathId, readJson, requiredText, validationResponse, type JsonObject } from './common.js';

function foodItemView(row: any) {
  return {
    id: row.id,
    name: row.name,
    default_unit: row.default_unit,
    calories_per_100g: row.calories_per_100g,
    protein_per_100g: row.protein_per_100g,
    carbohydrates_per_100g: row.carbohydrates_per_100g,
    fat_per_100g: row.fat_per_100g,
    fiber_per_100g: row.fiber_per_100g,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function loadFoodItem(db: Database.Database, id: number) {
  return db.prepare('SELECT * FROM food_items WHERE id = ?').get(id) as any;
}

function foodItemPayload(body: JsonObject, current?: any) {
  const errors: Record<string, string> = {};
  const value = (key: string) => hasOwn(body, key) ? body[key] : current?.[key];

  const name = requiredText(value('name'));
  const defaultUnit = requiredText(value('default_unit')) || 'g';

  if (!name) errors.name = 'Nama bahan wajib diisi.';

  const nutritionFields = [
    'calories_per_100g', 'protein_per_100g', 'carbohydrates_per_100g',
    'fat_per_100g', 'fiber_per_100g',
  ] as const;

  const nutrition: Record<string, number | null> = {};
  for (const field of nutritionFields) {
    const raw = value(field);
    if (raw === null || raw === undefined || raw === '') {
      nutrition[field] = null;
    } else {
      const parsed = decimalValue(raw);
      if (parsed === null || parsed < 0) {
        errors[field] = 'Nilai gizi harus berupa angka nol atau lebih.';
      } else {
        nutrition[field] = parsed;
      }
    }
  }

  if (Object.keys(errors).length) return { errors };
  return {
    value: {
      name,
      defaultUnit,
      calories: nutrition.calories_per_100g,
      protein: nutrition.protein_per_100g,
      carbohydrates: nutrition.carbohydrates_per_100g,
      fat: nutrition.fat_per_100g,
      fiber: nutrition.fiber_per_100g,
    },
  };
}

export function registerFoodItemRoutes(app: Hono<AuthEnv>, db: Database.Database) {
  app.get('/api/admin/food-items', (c) => {
    const { page, perPage, offset } = pagination(c);
    const where: string[] = [];
    const params: unknown[] = [];
    const search = c.req.query('search');
    if (search) { where.push('fi.name LIKE ? ESCAPE \'\\\''); params.push(likePattern(search)); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (db.prepare(`SELECT COUNT(*) AS count FROM food_items fi ${clause}`).get(...params) as any).count as number;
    const rows = db.prepare(`
      SELECT fi.*
      FROM food_items fi
      ${clause}
      ORDER BY fi.name ASC
      LIMIT ? OFFSET ?
    `).all(...params, perPage, offset);
    return c.json({ data: rows.map(foodItemView), pagination: paginationResponse(page, perPage, total) });
  });

  app.get('/api/admin/food-items/all', (c) => {
    const rows = db.prepare('SELECT fi.* FROM food_items fi ORDER BY fi.name ASC').all();
    return c.json({ data: rows.map(foodItemView) });
  });

  app.get('/api/admin/food-items/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID bahan tidak valid.' });
    const row = loadFoodItem(db, id);
    return row ? c.json({ data: foodItemView(row) }) : c.json({ message: 'Bahan tidak ditemukan.' }, 404);
  });

  app.post('/api/admin/food-items', async (c) => {
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = foodItemPayload(body);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    const result = db.prepare(`
      INSERT INTO food_items (name, default_unit, calories_per_100g, protein_per_100g, carbohydrates_per_100g, fat_per_100g, fiber_per_100g)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(payload.value.name, payload.value.defaultUnit, payload.value.calories, payload.value.protein, payload.value.carbohydrates, payload.value.fat, payload.value.fiber);
    return c.json({ data: foodItemView(loadFoodItem(db, Number(result.lastInsertRowid))), message: 'Bahan berhasil ditambahkan.' }, 201);
  });

  const updateFoodItem = async (c: any) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID bahan tidak valid.' });
    const current = loadFoodItem(db, id);
    if (!current) return c.json({ message: 'Bahan tidak ditemukan.' }, 404);
    const body = await readJson(c);
    if (!body) return validationResponse(c, { body: 'Body JSON wajib diisi.' });
    const payload = foodItemPayload(body, current);
    if ('errors' in payload) return validationResponse(c, payload.errors);
    db.prepare(`
      UPDATE food_items SET name = ?, default_unit = ?, calories_per_100g = ?, protein_per_100g = ?, carbohydrates_per_100g = ?, fat_per_100g = ?, fiber_per_100g = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).run(payload.value.name, payload.value.defaultUnit, payload.value.calories, payload.value.protein, payload.value.carbohydrates, payload.value.fat, payload.value.fiber, id);
    return c.json({ data: foodItemView(loadFoodItem(db, id)), message: 'Bahan berhasil diperbarui.' });
  };
  app.put('/api/admin/food-items/:id', updateFoodItem);
  app.patch('/api/admin/food-items/:id', updateFoodItem);

  app.delete('/api/admin/food-items/:id', (c) => {
    const id = pathId(c.req.param('id'));
    if (id === null) return validationResponse(c, { id: 'ID bahan tidak valid.' });
    const inUse = db.prepare('SELECT 1 FROM menu_compositions WHERE food_item_id = ? LIMIT 1').get(id);
    if (inUse) return c.json({ message: 'Bahan masih digunakan oleh menu dan tidak dapat dihapus.' }, 409);
    const result = db.prepare('DELETE FROM food_items WHERE id = ?').run(id);
    return result.changes ? c.json({ message: 'Bahan berhasil dihapus.' }) : c.json({ message: 'Bahan tidak ditemukan.' }, 404);
  });
}
