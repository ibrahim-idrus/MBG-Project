import { createServer } from 'node:http';
import { createTestApp } from '../helpers/test-app.mjs';
import { ensureDummyMasterData } from '../../dist/db/dummy-master-data.js';
import { createFetchRequest } from '../../dist/index.js';

const { app, db } = createTestApp();
ensureDummyMasterData(db);
const port = Number(process.env.PORT || 3219);
createServer(async (req, res) => {
  const response = await app.fetch(createFetchRequest(req, new URL(req.url, 'http://127.0.0.1:' + port)));
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(await response.text());
}).listen(port, '127.0.0.1');
