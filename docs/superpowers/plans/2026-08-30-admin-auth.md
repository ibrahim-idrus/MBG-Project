# Admin Authentication & Authorization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make admin registration/login functional and protect every `/admin/*` route with an active SQLite-backed admin session.

**Architecture:** Add a small auth module around the existing `better-sqlite3` database. Registration and login create opaque, expiring server-side sessions represented in the browser by an HTTP-only cookie; middleware resolves that session and places a safe admin identity in Hono context. The Hono app becomes a factory accepting a database instance so HTTP tests can use isolated temporary databases while the production entry point uses the normal database.

**Tech Stack:** TypeScript, Hono, Hono JSX, SQLite via `better-sqlite3`, bcrypt, Node built-in `node:test` runner, compiled JavaScript test files.

**Spec:** `docs/superpowers/specs/2026-08-30-admin-auth-design.md`

## Global Constraints

- Registration creates only an active `admin`; the browser cannot choose role, status, or identity fields.
- Passwords are hashed with the existing `bcrypt` dependency; no password or hash is returned.
- Sessions store only a SHA-256 token hash in SQLite; raw tokens exist only in HTTP-only cookies.
- `/admin/*` requires an unexpired, unrevoked session for an active admin with role `admin` or `super_admin`.
- API unauthorized responses are JSON `401`; browser page unauthorized responses redirect to `/login` with a safe local `next` path.
- Do not add public-user authentication, password reset, MFA, invitations, or feature CRUD endpoints.

---

### Task 1: Add a testable database boundary and auth-session schema

**Files:**
- Create: `src/db/database.ts`
- Create: `src/db/migrations/009_create_auth_sessions.sql`
- Modify: `src/db/migrate.ts`
- Modify: `package.json`
- Create: `tests/helpers/database.test.mjs`
- Create: `tests/helpers/test-database.mjs`

**Interfaces:**
- `createDatabase(dbPath?: string): Database.Database` opens the supplied SQLite path, enables foreign keys, and returns a database handle.
- `runMigrations(db?: Database.Database): void` applies the ordered migrations to the supplied database and closes only databases it opened itself.
- `DATABASE_PATH` environment variable selects the production database path; the default remains `data/mbg.db` relative to the project runtime.
- The migration creates `auth_sessions(id, admin_id, token_hash, expires_at, revoked_at, created_at)` with a unique token hash index and an admin foreign key.

- [ ] **Step 1: Write the failing migration/database test**

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../../dist/db/database.js';
import { runMigrations } from '../../dist/db/migrate.js';

test('database enables foreign keys and exposes the auth session table after migrations', () => {
  const db = createDatabase(':memory:');
  runMigrations(db);
  assert.equal(db.pragma('foreign_keys', { simple: true }), 1);
  assert.deepEqual(db.prepare("SELECT name FROM sqlite_master WHERE name = 'auth_sessions'").get(), { name: 'auth_sessions' });
  db.close();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run build; node --test tests/helpers/database.test.mjs`

Expected: FAIL because `src/db/database.ts` and the test file do not yet exist.

- [ ] **Step 3: Implement the database helper, migration, migration registration, and test script**

Implement `createDatabase` with `better-sqlite3`, `mkdirSync(dirname(path), { recursive: true })` for file paths, `PRAGMA foreign_keys = ON`, and the existing default database location. Refactor `runMigrations` to accept an optional database handle and to avoid closing a caller-owned handle. Add `009_create_auth_sessions.sql` and append it to the ordered migration list. Add `tests/helpers/test-database.mjs` exporting `createTestDatabase()` (an in-memory database plus `runMigrations`) and `insertAdmin(db, overrides)` for later tests. Set `npm test` to `npm run build && node --test tests/**/*.test.mjs`.

- [ ] **Step 4: Run the focused test and build**

Run: `npm run build; node --test tests/helpers/database.test.mjs`

Expected: PASS and exit code 0.

- [ ] **Step 5: Commit the database boundary**

```bash
git add src/db/database.ts src/db/migrations/009_create_auth_sessions.sql src/db/migrate.ts package.json tests/helpers/database.test.mjs tests/helpers/test-database.mjs
git commit -m "feat: add auth session database boundary"
```

### Task 2: Implement password, validation, and session services with TDD

**Files:**
- Create: `src/auth/password.ts`
- Create: `src/auth/validation.ts`
- Create: `src/auth/session.ts`
- Create: `tests/auth/auth-services.test.mjs`

**Interfaces:**
- `hashPassword(password: string): Promise<string>` and `verifyPassword(password: string, hash: string): Promise<boolean>`.
- `validateRegistration(input: RegistrationInput): ValidationResult<NormalizedRegistrationInput>` returns normalized email/name or field errors.
- `validateLogin(input: LoginInput): ValidationResult<NormalizedLoginInput>` returns normalized email or a field error.
- `isSafeNextPath(value: string | null): boolean` accepts only a single-origin relative path beginning with `/` and rejects `//`, schemes, and malformed values.
- `createSession(db, adminId, now = new Date()): { token: string; expiresAt: Date }` inserts a hashed random token and returns the raw token for the cookie.
- `findSessionAdmin(db, token, now = new Date()): AdminIdentity | null` returns only `id`, `name`, `email`, and `role` for an active, authorized admin.
- `revokeSession(db, token): void` revokes the matching session.
- `AdminIdentity` is `{ id: number; name: string; email: string; role: 'admin' | 'super_admin' }`.

- [ ] **Step 1: Write failing service tests**

```javascript
test('registration validation normalizes email and rejects short or mismatched passwords', () => {
  assert.deepEqual(validateRegistration({ name: '  Baim  ', email: ' BAIM@EXAMPLE.COM ', password: 'short', confirm_password: 'different' }), {
    ok: false,
    errors: { password: 'Kata sandi minimal 8 karakter.', confirm_password: 'Konfirmasi kata sandi tidak cocok.' }
  });
  assert.deepEqual(validateRegistration({ name: '  Baim  ', email: ' BAIM@EXAMPLE.COM ', password: 'password123', confirm_password: 'password123' }), {
    ok: true,
    value: { name: 'Baim', email: 'baim@example.com', password: 'password123' }
  });
});

test('session token authorizes only an active admin and never exposes a password hash', () => {
  const db = createTestDatabase();
  insertAdmin(db, { status: 'active', role: 'admin' });
  const { token } = createSession(db, 1, new Date('2026-08-30T00:00:00.000Z'));
  assert.deepEqual(findSessionAdmin(db, token, new Date('2026-08-30T00:01:00.000Z')), { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' });
  assert.equal(findSessionAdmin(db, token, new Date('2026-09-30T00:00:00.000Z')), null);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm run build; node --test tests/auth/auth-services.test.mjs`

Expected: FAIL with missing auth modules/functions, not a test-runner error.

- [ ] **Step 3: Implement the minimal service code**

Use bcrypt’s async API, `randomBytes(32)` for raw session tokens, `createHash('sha256')` for stored token hashes, a 7-day session expiry, parameterized SQL, and the exact validation rules from the spec. Use constant-time bcrypt verification for credential checks; inactive admins must return `null` from session lookup.

- [ ] **Step 4: Run focused tests and refactor only after green**

Run: `npm run build; node --test tests/auth/auth-services.test.mjs`

Expected: PASS with no warnings. Remove duplication only while keeping all assertions green.

- [ ] **Step 5: Commit the auth services**

```bash
git add src/auth tests/auth/auth-services.test.mjs
git commit -m "feat: add password validation and session services"
```

### Task 3: Add registration, login, and logout routes

**Files:**
- Modify: `src/server.tsx`
- Modify: `src/pages/auth/login.tsx`
- Modify: `src/pages/auth/register.tsx`
- Create: `tests/auth/auth-routes.test.mjs`
- Create: `tests/helpers/test-app.mjs`

**Interfaces:**
- `createApp(db: Database.Database): Hono` returns a fully configured Hono app for production or isolated tests.
- `POST /register` accepts `name`, `email`, `password`, and `confirm_password`, creates an active admin with role `admin`, sets the session cookie, and redirects to `/admin`.
- `POST /login` accepts `email`, `password`, and optional `next`, sets a session cookie, and redirects to a safe local path or `/admin`.
- `POST /logout` revokes the current cookie session and sends an expired replacement cookie before redirecting to `/login`.
- `createTestApp()` returns `{ app, db }` using an isolated migrated database; `createTestAppWithAdmin(overrides?)` inserts an admin and returns `{ app, db, admin }`.

- [ ] **Step 1: Write failing route tests**

```javascript
test('register creates an admin, starts a session, and redirects to the dashboard', async () => {
  const app = createTestApp();
  const response = await app.request('/register', { method: 'POST', body: new URLSearchParams({ name: 'New Admin', email: 'NEW@EXAMPLE.COM', password: 'password123', confirm_password: 'password123' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/admin');
  assert.match(response.headers.get('set-cookie') ?? '', /mbg_session=/);
  assert.equal(app.db.prepare('SELECT role, status FROM admins WHERE email = ?').get('new@example.com').role, 'admin');
});

test('login rejects invalid credentials without revealing whether email exists', async () => {
  const app = createTestAppWithAdmin();
  const response = await app.request('/login', { method: 'POST', body: new URLSearchParams({ email: 'admin@example.com', password: 'wrongpass' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(response.status, 401);
  const body = await response.text();
  assert.match(body, /Email atau kata sandi tidak valid/);
  assert.doesNotMatch(body, /password_hash/);
});
```

- [ ] **Step 2: Run route tests to verify they fail**

Run: `npm run build; node --test tests/auth/auth-routes.test.mjs`

Expected: FAIL because `createApp` and the handlers are not implemented.

- [ ] **Step 3: Implement the app factory and auth handlers**

Move existing route registration into `createApp(db = createDatabase())` and export `app = createApp()` for the current entry point. Parse form bodies with Hono’s `c.req.parseBody()`, use the auth services, translate duplicate-email SQLite errors to a validation response, set cookies with `HttpOnly`, `SameSite=Lax`, `Path=/`, and conditional `Secure`, and render pages with an `error` prop on failures. Use one generic login error for nonexistent, incorrect, or inactive accounts.

- [ ] **Step 4: Run focused route tests and typecheck**

Run: `npm run build; node --test tests/auth/auth-routes.test.mjs`

Expected: PASS and a successful TypeScript build.

- [ ] **Step 5: Commit the auth routes**

```bash
git add src/server.tsx src/pages/auth/login.tsx src/pages/auth/register.tsx tests/auth/auth-routes.test.mjs
git commit -m "feat: make admin auth routes functional"
```

### Task 4: Protect admin pages and expose request identity

**Files:**
- Create: `src/auth/middleware.ts`
- Modify: `src/server.tsx`
- Modify: `src/components/Sidebar.tsx`
- Create: `tests/auth/authorization.test.mjs`
- Modify: `tests/helpers/test-app.mjs`

**Interfaces:**
- Hono context variable `admin` has type `AdminIdentity` and is available to protected handlers via `c.get('admin')`.
- `requireAdmin` checks the session cookie and returns a browser redirect or JSON `401` depending on the request path/accept header.
- All existing `/admin`, `/admin/keuangan`, `/admin/keuangan/statistik`, `/admin/menu`, `/admin/menu/tambah`, and `/admin/aspirasi` routes use the middleware.
- `GET /api/auth/me` returns `{ data: { id, name, email, role } }` only for an authorized session, otherwise `{ message }` with status `401`.

- [ ] **Step 1: Write failing authorization tests**

```javascript
test('unauthenticated browser requests cannot render admin pages', async () => {
  const app = createTestApp();
  const response = await app.request('/admin/menu');
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/login?next=%2Fadmin%2Fmenu');
});

test('an authenticated admin can access a protected page and /api/auth/me', async () => {
  const app = createTestAppWithSession({ role: 'admin', status: 'active' });
  const page = await app.request('/admin');
  assert.equal(page.status, 200);
  const me = await app.request('/api/auth/me', { headers: { cookie: app.sessionCookie } });
  assert.deepEqual(await me.json(), { data: { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' } });
});
```

- [ ] **Step 2: Run authorization tests to verify they fail**

Run: `npm run build; node --test tests/auth/authorization.test.mjs`

Expected: FAIL because admin routes are currently public and no middleware exists.

- [ ] **Step 3: Implement middleware and logout UI**

Use Hono’s `createMiddleware`, define the context type, distinguish API requests by `/api/` path or an `Accept: application/json` header, validate `next` with `isSafeNextPath`, and set the resolved admin in context. Wrap both `/admin` and `/admin/*` route declarations in middleware. Add `GET /api/auth/me` after the middleware is in place so it returns `{ data: { id, name, email, role } }` only for an authorized session. Update `tests/helpers/test-app.mjs` with `createTestAppWithSession(overrides?)`, which creates an admin, calls the real session service, and returns `{ app, db, admin, sessionCookie }`. Replace the sidebar’s placeholder end area with a compact POST logout form.

- [ ] **Step 4: Run authorization tests and full route tests**

Run: `npm run build; node --test tests/auth/*.test.mjs`

Expected: PASS; unauthenticated pages redirect, API calls return JSON `401`, active admins are authorized, and logout revokes access.

- [ ] **Step 5: Commit authorization protection**

```bash
git add src/auth/middleware.ts src/server.tsx src/components/Sidebar.tsx tests/auth/authorization.test.mjs
git commit -m "feat: protect admin routes with session authorization"
```

### Task 5: Verify the complete login/register flow and existing app behavior

**Files:**
- Modify: `src/db/migrate.ts` only if verification exposes an ordering/path issue.
- Modify: `src/pages/auth/login.tsx` and `src/pages/auth/register.tsx` only for verified form/error rendering issues.
- Create: `tests/auth/security-regressions.test.mjs` if a missing regression case is identified during implementation.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: all auth service, route, authorization, and regression tests pass with exit code 0.

- [ ] **Step 2: Run migration and seeded-app smoke checks**

Run: `npm run migrate; npm run seed; npm run build`

Expected: migrations are idempotent, the existing seed account remains usable, and the build exits 0.

- [ ] **Step 3: Exercise the real HTTP flow**

Start the app with `npm run dev`, then verify:

```text
GET  /login                         -> 200
POST /register                      -> 302 with mbg_session cookie
GET  /admin                         -> 200 with that cookie
GET  /api/auth/me                   -> 200 safe identity JSON
POST /logout                        -> 302, expired cookie
GET  /admin                         -> 302 to /login after logout
POST /login                         -> 302 with a new session cookie
GET  /admin/menu                    -> 200 with the authenticated cookie
GET  /admin/menu?next=https://evil  -> never redirects off-site
```

- [ ] **Step 4: Inspect the final diff and run the final verification command**

Run: `git status --short; git diff HEAD~4..HEAD --stat; npm test; npm run build`

Expected: only auth-related files and the approved spec/plan are changed; tests and build both exit 0.

- [ ] **Step 5: Report verified endpoints, validation, authorization, database changes, tests, and files changed**

Use the actual command output and final diff; do not claim browser/render verification unless the HTTP smoke checks completed successfully.
