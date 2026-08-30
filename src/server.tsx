import 'dotenv/config';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type Database from 'better-sqlite3';
import { KeuanganPage } from './pages/keuangan.js';
import { DashboardPage } from './pages/dashboard.js';
import { MenuPage } from './pages/menu.js';
import { StatistikPage } from './pages/statistik.js';
import { AspirasiPage } from './pages/aspirasi.js';
import { LokasiPage } from './pages/user/lokasi.js';
import { JadwalMenuPage } from './pages/user/jadwal-menu.js';
import { LaporanPage } from './pages/user/laporan.js';
import { KeuanganUserPage } from './pages/user/keuangan.js';
import { DetailSekolahPage } from './pages/user/detail-sekolah.js';
import { DetailDapurPage } from './pages/user/detail-dapur.js';
import { LoginPage } from './pages/auth/login.js';
import { RegisterPage } from './pages/auth/register.js';
import { hashPassword, verifyPassword } from './auth/password.js';
import { createSession, revokeSession } from './auth/session.js';
import { requireAdmin, SESSION_COOKIE, type AuthEnv } from './auth/middleware.js';
import { isSafeNextPath, validateLogin, validateRegistration } from './auth/validation.js';
import { createDatabase } from './db/database.js';
import { registerMenuRoutes } from './api/menus.js';
import { registerFinanceRoutes } from './api/finance.js';
import { registerAspirationRoutes } from './api/aspirations.js';
import { registerMasterDataRoutes } from './api/master-data.js';
import { AdminLokasiPage } from './pages/admin-lokasi.js';

const GENERIC_LOGIN_ERROR = 'Email atau kata sandi tidak valid.';
const DUPLICATE_EMAIL_ERROR = 'Email sudah terdaftar.';
const DUMMY_PASSWORD_HASH = '$2b$10$wWznOOkAOyiVJURj7HUEc.F9bnJNbH1efdOHvyTs6ev2x38l9TBrK';

type FormBody = Record<string, string | File>;

function formValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function validationError(errors: Record<string, string>): string {
  return Object.values(errors).join(' ');
}

function isSecureRequest(url: string): boolean {
  return new URL(url).protocol === 'https:';
}

function sessionCookieOptions(url: string) {
  return {
    httpOnly: true,
    sameSite: 'Lax' as const,
    path: '/',
    secure: isSecureRequest(url),
  };
}

function isDuplicateEmailError(error: unknown): boolean {
  return error instanceof Error && /UNIQUE constraint failed: admins\.email|idx_admins_email/i.test(error.message);
}

export function createApp(
  db: Database.Database = createDatabase(),
  verifyPasswordFn: typeof verifyPassword = verifyPassword,
): Hono<AuthEnv> {
  const app = new Hono<AuthEnv>();

  app.get('/', (c) => c.html(<LokasiPage />));

  app.get('/login', (c) => c.html(<LoginPage next={c.req.query('next')} />));
  app.post('/login', async (c) => {
    const body = await c.req.parseBody() as FormBody;
    const validation = validateLogin({
      email: formValue(body.email),
      password: formValue(body.password),
    });
    const next = formValue(body.next) || null;

    if (!validation.ok) {
      return c.html(<LoginPage error={validationError(validation.errors)} next={next ?? undefined} />, 400);
    }

    const admin = db.prepare(`
      SELECT id, password_hash, status
      FROM admins
      WHERE email = ?
      LIMIT 1
    `).get(validation.value.email) as { id: number; password_hash: string; status: string } | undefined;
    const passwordMatches = await verifyPasswordFn(
      validation.value.password,
      admin?.password_hash ?? DUMMY_PASSWORD_HASH,
    );

    if (!admin || admin.status !== 'active' || !passwordMatches) {
      return c.html(<LoginPage error={GENERIC_LOGIN_ERROR} next={next ?? undefined} />, 401);
    }

    db.prepare(`
      UPDATE admins
      SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(admin.id);

    const session = createSession(db, admin.id);
    setCookie(c, SESSION_COOKIE, session.token, {
      ...sessionCookieOptions(c.req.url),
      expires: session.expiresAt,
    });

    const redirectPath = next !== null && isSafeNextPath(next) ? next : '/admin';
    return c.redirect(redirectPath, 302);
  });

  app.get('/register', (c) => c.html(<RegisterPage />));
  app.post('/register', async (c) => {
    const body = await c.req.parseBody() as FormBody;
    const validation = validateRegistration({
      name: formValue(body.name ?? body.fullname),
      email: formValue(body.email),
      password: formValue(body.password),
      confirm_password: formValue(body.confirm_password),
    });

    if (!validation.ok) {
      return c.html(<RegisterPage error={validationError(validation.errors)} />, 400);
    }

    const passwordHash = await hashPassword(validation.value.password);
    let adminId: number;

    try {
      const result = db.prepare(`
        INSERT INTO admins (name, email, password_hash, role, status)
        VALUES (?, ?, ?, 'admin', 'active')
      `).run(validation.value.name, validation.value.email, passwordHash);
      adminId = Number(result.lastInsertRowid);
    } catch (error) {
      if (!isDuplicateEmailError(error)) {
        throw error;
      }

      return c.html(<RegisterPage error={DUPLICATE_EMAIL_ERROR} />, 400);
    }

    const session = createSession(db, adminId);
    setCookie(c, SESSION_COOKIE, session.token, {
      ...sessionCookieOptions(c.req.url),
      expires: session.expiresAt,
    });

    return c.redirect('/admin', 302);
  });

  app.post('/logout', (c) => {
    const token = getCookie(c, SESSION_COOKIE);
    if (token) {
      revokeSession(db, token);
    }

    setCookie(c, SESSION_COOKIE, '', {
      ...sessionCookieOptions(c.req.url),
      expires: new Date(0),
      maxAge: 0,
    });

    return c.redirect('/login', 302);
  });

  // Public user routes
  app.get('/lokasi', (c) => c.html(<LokasiPage />));
  app.get('/lokasi/sekolah/:id', (c) => {
    const id = c.req.param('id');
    return c.html(<DetailSekolahPage id={id} />);
  });
  app.get('/lokasi/dapur/:id', (c) => {
    const id = c.req.param('id');
    return c.html(<DetailDapurPage id={id} />);
  });
  app.get('/menu', (c) => c.html(<JadwalMenuPage />));
  app.get('/laporan', (c) => c.html(<LaporanPage />));
  app.get('/keuangan', (c) => c.html(<KeuanganUserPage />));

  // Admin routes (protected)
  const adminMiddleware = requireAdmin(db);
  app.use('/admin', adminMiddleware);
  app.use('/admin/*', adminMiddleware);
  app.use('/api/admin', adminMiddleware);
  app.use('/api/admin/*', adminMiddleware);
  app.get('/api/auth/me', adminMiddleware, (c) => c.json({ data: c.get('admin') }));

  app.get('/admin', (c) => c.html(<DashboardPage />));
  app.get('/admin/keuangan', (c) => c.html(<KeuanganPage />));
  app.get('/admin/keuangan/statistik', (c) => c.html(<StatistikPage />));
  app.get('/admin/menu', (c) => c.html(<MenuPage />));
  app.get('/admin/menu/tambah', (c) => c.html(<MenuPage />));
  app.get('/admin/aspirasi', (c) => c.html(<AspirasiPage />));
  app.get('/admin/lokasi', (c) => c.html(<AdminLokasiPage />));

  registerMenuRoutes(app, db);
  registerFinanceRoutes(app, db);
  registerAspirationRoutes(app, db);
  registerMasterDataRoutes(app, db);

  return app;
}

export const app = createApp();

export default app;
