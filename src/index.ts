import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { pathToFileURL } from 'node:url';
import app from './server.js';
import { runMigrations } from './db/migrate.js';
import { ensureDummyMasterData } from './db/dummy-master-data.js';

const port = Number(process.env.PORT ?? 3000);
const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);

export function createFetchRequest(req: IncomingMessage, url: URL): Request {
  const method = (req.method || 'GET').toUpperCase();
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  const requestInit: RequestInit & { duplex?: 'half' } = {
    method,
    headers,
  };

  if (BODY_METHODS.has(method)) {
    requestInit.body = req as unknown as BodyInit;
    requestInit.duplex = 'half';
  }

  return new Request(url.toString(), requestInit);
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);
  const request = createFetchRequest(req, url);

  try {
    const response = await app.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));

    if (response.body) {
      const body = await response.text();
      res.end(body);
    } else {
      res.end();
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runMigrations();
  if (!process.env.DATABASE_PATH) ensureDummyMasterData();
  server.listen(port, () => {
    console.log(`MBG Transparansi running on http://localhost:${port}`);
  });
}
