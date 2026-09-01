import 'dotenv/config';
import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type Database from 'better-sqlite3';
import { KeuanganPage } from './pages/keuangan.js';
import { DashboardPage } from './pages/dashboard.js';
import { StatistikPage } from './pages/statistik.js';
import { AspirasiPage } from './pages/aspirasi.js';
import { LokasiPage } from './pages/user/lokasi.js';
import { JadwalMenuPage } from './pages/user/jadwal-menu.js';
import { LaporanPage } from './pages/user/laporan.js';
import { KeuanganUserPage } from './pages/user/keuangan.js';
import { DetailSekolahPage } from './pages/user/detail-sekolah.js';
import { DetailDapurPage } from './pages/user/detail-dapur.js';
import { CekMbgPage } from './pages/user/cek-mbg.js';
import { LoginPage } from './pages/auth/login.js';
import { RegisterPage } from './pages/auth/register.js';
import { hashPassword, verifyPassword } from './auth/password.js';
import { createSession, revokeSession } from './auth/session.js';
import { requireAdmin, SESSION_COOKIE, type AuthEnv } from './auth/middleware.js';
import { isSafeNextPath, validateLogin, validateRegistration } from './auth/validation.js';
import { createDatabase } from './db/database.js';
import { registerMenuRoutes, createPublicMenuRouter } from './api/menus.js';
import publicFinance from './api/finance.js';
import { registerFinanceRoutes } from './api/finance.js';
import { registerAspirationRoutes } from './api/aspirations.js';
import { registerMasterDataRoutes } from './api/master-data.js';
import { registerLocationCheckRoutes } from './api/location-check.js';
import { registerFoodItemRoutes } from './api/food-items.js';
import { AdminLokasiPage } from './pages/admin-lokasi.js';
import { FoodItemsPage } from './pages/admin/food-items.js';
import { MenuMingguanPage } from './pages/menu-mingguan.js';
import { MenuPage } from './pages/menu.js';
import { TambahHariPage } from './pages/tambah-hari.js';
import { TambahMingguanPage } from './pages/tambah-mingguan.js';
import { AdminProfilePage } from './pages/admin/profile.js';
import { getSchoolsByKitchenId } from './db/queries.js';

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

  app.get('/', (c) => c.html(<LokasiPage db={db} />));

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

    // Link the new admin to the first available active kitchen so they can
    // immediately manage aspirations for it.
    db.prepare(
      `INSERT OR IGNORE INTO admin_kitchens (admin_id, kitchen_id)
       SELECT ?, id FROM mbg_kitchens WHERE status = 'active' ORDER BY id ASC LIMIT 1`
    ).run(adminId);

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
  app.get('/lokasi', (c) => c.html(<LokasiPage db={db} />));
  app.get('/lokasi/sekolah/:id', (c) => {
    const id = c.req.param('id');
    return c.html(<DetailSekolahPage id={id} />);
  });
  app.get('/lokasi/dapur/:id', (c) => {
    const id = c.req.param('id');
    return c.html(<DetailDapurPage id={id} />);
  });
  app.get('/cek-mbg', (c) => c.html(<CekMbgPage db={db} initialKitchenId={c.req.query('kitchen_id')} />));
  app.get('/cek-mbg/:id', (c) => c.html(<CekMbgPage db={db} initialKitchenId={c.req.param('id')} />));
  app.get('/menu', (c) => c.html(<JadwalMenuPage />));
  app.get('/laporan', (c) => c.html(<LaporanPage />));
  app.get('/keuangan', (c) => c.html(<KeuanganUserPage />));

  // Public menu API (READ-only, no auth required)
  app.route('/api', createPublicMenuRouter(db));
  // Public finance API (READ-only, no auth required)
  app.route('/api', publicFinance);

  // Public lookup endpoints used by the user-facing menu picker. The user
  // page must select a kitchen or school before it will render any menus, so
  // these endpoints are intentionally read-only and filter by status.
  app.get('/api/schools', (c) => {
    const kitchenIdRaw = c.req.query('kitchen_id');
    const where: string[] = ["s.status = 'active'"];
    const params: unknown[] = [];
    if (kitchenIdRaw) {
      const kid = Number(kitchenIdRaw);
      if (!Number.isInteger(kid) || kid <= 0) return c.json({ error: 'Parameter kitchen_id tidak valid.' }, 400);
      where.push('s.kitchen_id = ?');
      params.push(kid);
    }
    const rows = db
      .prepare(
        `SELECT s.id, s.name, s.npsn, s.kitchen_id, k.name AS kitchen_name, k.code AS kitchen_code
           FROM schools s
           JOIN mbg_kitchens k ON k.id = s.kitchen_id
          WHERE ${where.join(' AND ')}
          ORDER BY s.name ASC`
      )
      .all(...params);
    return c.json({ data: rows });
  });

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
  app.get('/admin/menu/mingguan', (c) => c.html(<MenuMingguanPage />));
  app.get('/admin/menu/tambah', (c) => c.html(<MenuPage />));
  app.get('/admin/menu/tambah-hari', (c) => c.html(<TambahHariPage />));
  app.get('/admin/menu/tambah-mingguan', (c) => c.html(<TambahMingguanPage />));
  app.get('/admin/food-items', (c) => c.html(<FoodItemsPage />));
  app.get('/admin/aspirasi', (c) => c.html(<AspirasiPage />));
  app.get('/admin/lokasi', (c) => c.html(<AdminLokasiPage />));
  app.get('/admin/profile', (c) => {
    const session = c.get('admin');
    const kitchenRows = db
      .prepare(
        `SELECT k.id, k.name, k.code, k.city, k.province, k.status
           FROM mbg_kitchens k
           JOIN admin_kitchens ak ON ak.kitchen_id = k.id
          WHERE ak.admin_id = ?
          ORDER BY k.name ASC`
      )
      .all(session.id) as { id: number; name: string; code: string; city: string; province: string; status: string }[];

    const kitchens = kitchenRows.map((k) => ({
      ...k,
      schools: getSchoolsByKitchenId(k.id) as Array<{
        id: number;
        name: string;
        npsn: string;
        student_count: number;
        status: string;
      }>,
    }));

    const totalSchools = kitchens.reduce((sum, k) => sum + k.schools.length, 0);
    const totalStudents = kitchens.reduce(
      (sum, k) => sum + k.schools.reduce((s, school) => s + school.student_count, 0),
      0,
    );

    return c.html(
      <AdminProfilePage
        admin={{ id: session.id, name: session.name, email: session.email, role: session.role }}
        kitchens={kitchens}
        totalSchools={totalSchools}
        totalStudents={totalStudents}
      />,
    );
  });

  registerMenuRoutes(app, db);
  registerFinanceRoutes(app, db);
  registerAspirationRoutes(app, db);
  registerMasterDataRoutes(app, db);
  registerLocationCheckRoutes(app, db);
  registerFoodItemRoutes(app, db);

  return app;
}

export const app = createApp();

export default app;
