import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { Hono } from 'hono';
import { createFetchRequest } from '../../dist/index.js';

test('HTTP adapter forwards a POST stream and preserves its headers for Hono', async () => {
  const app = new Hono();
  app.post('/echo', async (c) => c.text(await c.req.text()));

  const incomingRequest = Object.assign(Readable.from(['email=admin%40example.com&password=password123']), {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-request-source': 'adapter-test',
    },
  });
  const request = createFetchRequest(incomingRequest, new URL('http://localhost/echo'));

  assert.equal(request.headers.get('content-type'), 'application/x-www-form-urlencoded');
  assert.equal(request.headers.get('x-request-source'), 'adapter-test');
  const response = await app.fetch(request);
  assert.equal(await response.text(), 'email=admin%40example.com&password=password123');
});
