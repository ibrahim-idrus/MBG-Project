import { getCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import type Database from 'better-sqlite3';
import { findSessionAdmin, type AdminIdentity } from './session.js';
import { isSafeNextPath } from './validation.js';

export const SESSION_COOKIE = 'mbg_session';

export type AuthEnv = {
  Variables: {
    admin: AdminIdentity;
  };
};

export function requireAdmin(db: Database.Database) {
  return createMiddleware<AuthEnv>(async (c, next) => {
    const admin = findSessionAdmin(db, getCookie(c, SESSION_COOKIE) ?? '');

    if (!admin) {
      const requestUrl = new URL(c.req.url);
      const nextPath = `${requestUrl.pathname}${requestUrl.search}`;
      const acceptsJson = (c.req.header('accept') ?? '').toLowerCase().includes('application/json');

      if (requestUrl.pathname.startsWith('/api/') || acceptsJson) {
        return c.json({ message: 'Unauthorized' }, 401);
      }

      const loginPath = isSafeNextPath(nextPath)
        ? `/login?next=${encodeURIComponent(nextPath)}`
        : '/login';
      return c.redirect(loginPath, 302);
    }

    c.set('admin', admin);
    await next();
  });
}
