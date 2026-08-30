# Admin Authentication & Authorization Design

**Date:** 2026-08-30  
**Scope:** Admin authentication and authorization only

## Goal

Make the existing admin login and registration pages functional and ensure all `/admin/*` pages require an authenticated, active admin session. The authenticated admin identity must be available to future backend CRUD handlers without trusting identity fields sent by the browser.

## Current Context

- The project uses Hono, TypeScript, SQLite via `better-sqlite3`, server-rendered Hono JSX, and `bcrypt`.
- `admins` already stores `name`, `email`, `password_hash`, `role`, `status`, and `last_login_at`.
- Login and register pages currently render static forms with `action="#"` and no handlers.
- Admin pages currently have no route protection.
- There is no existing session or token implementation.

## Decisions

### Registration policy

Registration is open for the current prototype because the requested flow includes a functional register page. Every newly registered account is created as an active `admin`. The browser cannot choose `role`, `status`, `admin_id`, or any creator identity. `super_admin` accounts remain seed/configuration-only.

### Session model

Use server-side sessions stored in SQLite. A cryptographically random opaque token is sent in an HTTP-only cookie. Only a SHA-256 hash of the token is stored in the database. Sessions have an expiry and a revocation timestamp, allowing logout without exposing credentials or storing bearer tokens in page markup.

Add a single migration for `auth_sessions` with:

- `id`
- `admin_id` foreign key to `admins`
- `token_hash` unique index
- `expires_at`
- `revoked_at`
- `created_at`

### HTTP behavior

Implement:

- `POST /register`: validate input, create the admin, start a session, and redirect to `/admin`.
- `POST /login`: validate credentials and active status, update `last_login_at`, start a session, and redirect to a safe local return path or `/admin`.
- `POST /logout`: revoke the current session, clear the cookie, and redirect to `/login`.
- `GET /api/auth/me`: return the authenticated admin’s public identity or `401`.

Failed form submissions return the corresponding auth page with a user-safe Indonesian error message and an appropriate `4xx` status. Password hashes and sensitive session values are never returned.

### Authorization boundary

Middleware runs for `/admin/*`. It resolves the cookie session, verifies the session is unrevoked and unexpired, loads the admin, and requires `status = 'active'` plus a valid admin role. The resolved admin is stored in Hono request context for future menu, finance, statistics, and aspiration endpoints. Unauthenticated browser requests redirect to `/login?next=...`; unauthenticated API requests return JSON `401`.

The `next` value is accepted only when it is a relative path beginning with `/` and not a protocol-relative URL, preventing open redirects.

### Validation

- Name: required after trimming.
- Email: required, normalized to lowercase, and validated as a basic email address.
- Password: required and at least 8 characters.
- Confirmation: must match the password.
- Duplicate email: rejected with a clear, non-sensitive message.
- Login failures use one generic message for unknown email, incorrect password, and inactive account.

## Components

- `src/auth/password.ts`: bcrypt hashing and comparison.
- `src/auth/session.ts`: token generation, hashing, session persistence, lookup, and revocation.
- `src/auth/middleware.ts`: authenticated-admin resolution and browser/API failure behavior.
- `src/auth/validation.ts`: registration/login validation and safe return-path validation.
- `src/db/database.ts`: shared database path/opening helper for runtime and tests.
- `src/db/migrations/009_create_auth_sessions.sql`: session schema.
- `src/server.tsx`: auth routes, middleware, and protected admin route grouping.
- `src/pages/auth/login.tsx` and `src/pages/auth/register.tsx`: real form actions and error rendering.
- `src/components/Sidebar.tsx`: logout form for authenticated admin sessions.

## Data Flow

1. Browser submits registration or login form.
2. Route validates input and queries `admins` through the existing SQLite database.
3. Registration hashes the password before insertion; login compares the submitted password with `password_hash`.
4. A random token is generated; its hash is inserted into `auth_sessions` with an expiry.
5. The raw token is sent only as an HTTP-only, SameSite cookie.
6. Admin middleware hashes the cookie token, loads the session and active admin, and sets the request context.
7. Future protected endpoints read the context identity rather than request body identity fields.

## Error Handling and Security

- Missing, invalid, expired, revoked, or admin-less sessions are unauthorized.
- Inactive admins cannot access protected routes even if they have a valid session.
- Database unique-constraint failures for email are translated into a validation response.
- Cookie settings are `HttpOnly`, `SameSite=Lax`, `Path=/`, and `Secure` when the request is HTTPS.
- Session expiration is checked on every request. Expired sessions are treated as logged out.
- No password, password hash, raw session token, or session hash appears in responses or logs.

## Testing Strategy

Use Node’s built-in test runner and isolated temporary SQLite databases. Test behavior at the service and HTTP route boundaries:

- registration creates a bcrypt-backed active admin and session;
- duplicate email, malformed input, short password, and mismatched confirmation fail;
- login succeeds with correct credentials and rejects incorrect/inactive accounts;
- protected admin routes redirect or return `401` without a session;
- valid sessions authorize protected routes and expose only safe admin identity;
- expired/revoked sessions fail authorization;
- logout revokes the session and clears the cookie;
- `next` cannot redirect off-site;
- responses do not expose password hashes or session tokens.

## Out of Scope

Forgot-password, email verification, MFA, rate limiting, admin invitation workflow, public-user accounts, and CRUD endpoints for menus, finance, statistics, kitchens, schools, or aspirations.
