import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));
const entrypoint = fileURLToPath(new URL('../../dist/index.js', import.meta.url));

function waitForStartup(child) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.includes('MBG Transparansi running on')) {
        resolve({ stdout, stderr });
      }
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      reject(new Error(`server exited before startup (code=${code}, signal=${signal})\n${stdout}\n${stderr}`));
    });
  });
}

function stopProcess(child) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve();

  return new Promise((resolve) => {
    child.once('exit', resolve);
    child.kill();
  });
}

test('production startup applies all migrations before listening on a fresh database', async (t) => {
  const tempDirectory = await mkdtemp(join(tmpdir(), 'mbg-task-5-'));
  const databasePath = join(tempDirectory, 'fresh.db');
  const server = spawn(process.execPath, [entrypoint], {
    cwd: projectRoot,
    env: { ...process.env, DATABASE_PATH: databasePath, PORT: '3991' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  t.after(async () => {
    await stopProcess(server);
    await rm(tempDirectory, { recursive: true, force: true });
  });

  await waitForStartup(server);

  const db = new Database(databasePath);
  try {
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name = 'admins'").get()?.name, 'admins');
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name = 'auth_sessions'").get()?.name, 'auth_sessions');
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM migrations').get().count >= 9, true);
  } finally {
    db.close();
  }
});
