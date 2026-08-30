import type { Context } from 'hono';

export type JsonObject = Record<string, unknown>;

export async function readJson(c: Context): Promise<JsonObject | null> {
  try {
    const value = await c.req.json<unknown>();
    return value !== null && typeof value === 'object' && !Array.isArray(value)
      ? value as JsonObject
      : null;
  } catch {
    return null;
  }
}

export function validationResponse(c: Context, errors: Record<string, string> | undefined, message = 'Data tidak valid.') {
  return c.json({ message, errors: errors ?? {} }, 400);
}

export function requiredText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function optionalText(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return typeof value === 'string' ? value.trim() || null : null;
}

export function integerValue(value: unknown): number | null {
  const number = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isInteger(number) ? number : null;
}

export function decimalValue(value: unknown): number | null {
  const number = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isFinite(number) ? number : null;
}

export function validDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : null;
}

export function queryInteger(value: string | undefined, fallback: number): number {
  const parsed = integerValue(value);
  return parsed !== null && parsed > 0 ? parsed : fallback;
}

export function pagination(c: Context) {
  const page = queryInteger(c.req.query('page'), 1);
  const perPage = Math.min(queryInteger(c.req.query('per_page') ?? c.req.query('limit'), 20), 100);
  return { page, perPage, offset: (page - 1) * perPage };
}

export function paginationResponse(page: number, perPage: number, total: number) {
  return { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) };
}

export function pathId(value: string | undefined): number | null {
  const parsed = integerValue(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

export function hasOwn(object: JsonObject, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function likePattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, '\\$&')}%`;
}

export function publicAdmin(row: { id: number; name: string; email: string; role: string }) {
  return { id: row.id, name: row.name, email: row.email, role: row.role };
}
