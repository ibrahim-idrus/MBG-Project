import { Hono } from 'hono';
import {
  getActiveKitchens,
  getKitchenFinancialSummary,
  getKitchenTransactions,
  getTransactionDetail,
  getTransactionCategories,
} from '../db/queries.js';

const finance = new Hono();

// GET /api/kitchens — list active MBG kitchens/offices
finance.get('/kitchens', (c) => {
  const kitchens = getActiveKitchens();
  return c.json({ data: kitchens });
});

// GET /api/kitchens/:id/summary — financial summary for a kitchen
finance.get('/kitchens/:id/summary', (c) => {
  const kitchenId = Number(c.req.param('id'));
  if (!kitchenId) return c.json({ error: 'Invalid kitchen ID' }, 400);

  const year = c.req.query('year') ? Number(c.req.query('year')) : undefined;
  const month = c.req.query('month') ? Number(c.req.query('month')) : undefined;

  const summary = getKitchenFinancialSummary(kitchenId, year, month);
  return c.json({ data: summary });
});

// GET /api/kitchens/:id/transactions — paginated transaction list
finance.get('/kitchens/:id/transactions', (c) => {
  const kitchenId = Number(c.req.param('id'));
  if (!kitchenId) return c.json({ error: 'Invalid kitchen ID' }, 400);

  const page = Number(c.req.query('page')) || 1;
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
  const type = c.req.query('type') || undefined;
  const category = c.req.query('category') || undefined;
  const dateFrom = c.req.query('date_from') || undefined;
  const dateTo = c.req.query('date_to') || undefined;
  const sort = (c.req.query('sort') as 'newest' | 'oldest') || 'newest';

  const result = getKitchenTransactions(kitchenId, {
    page, limit, type, category, dateFrom, dateTo, sort,
  });

  return c.json(result);
});

// GET /api/kitchens/:id/categories — distinct categories for a kitchen
finance.get('/kitchens/:id/categories', (c) => {
  const kitchenId = Number(c.req.param('id'));
  if (!kitchenId) return c.json({ error: 'Invalid kitchen ID' }, 400);

  const categories = getTransactionCategories(kitchenId);
  return c.json({ data: categories.map((r) => r.category) });
});

// GET /api/transactions/:id — transaction detail
finance.get('/transactions/:id', (c) => {
  const transactionId = Number(c.req.param('id'));
  if (!transactionId) return c.json({ error: 'Invalid transaction ID' }, 400);

  const detail = getTransactionDetail(transactionId);
  if (!detail) return c.json({ error: 'Transaction not found' }, 404);

  return c.json({ data: detail });
});

export default finance;
