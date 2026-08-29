import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import app from './server.js';

const port = 3000;

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
  });

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

server.listen(port, () => {
  console.log(`MBG Transparansi running on http://localhost:${port}`);
});
