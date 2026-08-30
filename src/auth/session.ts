import { createHash, randomBytes } from 'node:crypto';
import type Database from 'better-sqlite3';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export type AdminRole = 'admin' | 'super_admin';

export interface AdminIdentity {
  id: number;
  name: string;
  email: string;
  role: AdminRole;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function createSession(db: Database.Database, adminId: number, now = new Date()): { token: string; expiresAt: Date } {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  db.prepare(`
    INSERT INTO auth_sessions (admin_id, token_hash, expires_at, created_at)
    VALUES (?, ?, ?, ?)
  `).run(adminId, hashToken(token), expiresAt.toISOString(), now.toISOString());

  return { token, expiresAt };
}

export function findSessionAdmin(db: Database.Database, token: string, now = new Date()): AdminIdentity | null {
  if (!token) {
    return null;
  }

  const admin = db.prepare(`
    SELECT a.id, a.name, a.email, a.role
    FROM auth_sessions AS s
    INNER JOIN admins AS a ON a.id = s.admin_id
    WHERE s.token_hash = ?
      AND s.expires_at > ?
      AND s.revoked_at IS NULL
      AND a.status = ?
      AND a.role IN (?, ?)
    LIMIT 1
  `).get(hashToken(token), now.toISOString(), 'active', 'admin', 'super_admin') as AdminIdentity | undefined;

  return admin ?? null;
}

export function revokeSession(db: Database.Database, token: string): void {
  db.prepare(`
    UPDATE auth_sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token_hash = ?
      AND revoked_at IS NULL
  `).run(hashToken(token));
}
