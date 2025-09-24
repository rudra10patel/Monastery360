import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distDir = path.resolve(__dirname, '..', 'dist');
const indexHtmlPath = path.join(distDir, 'index.html');

// Ensure a build exists before starting the server (prevents ENOENT for index.html)
if (!fs.existsSync(indexHtmlPath)) {
  // eslint-disable-next-line no-console
  console.log('No build found. Running build now...');
  const result = spawnSync(process.execPath, [path.resolve(__dirname, '..', 'scripts', 'build.mjs')], {
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    // eslint-disable-next-line no-console
    console.error('Build failed. Exiting.');
    process.exit(result.status || 1);
  }
}

// Serve built assets explicitly
app.use('/assets', express.static(path.join(distDir, 'assets'), { maxAge: '1y' }));
// Serve other static files (favicons, etc.) from dist root
app.use(express.static(distDir, { maxAge: '1d' }));

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// SPA fallback to index.html
app.get('*', (_req, res) => {
  if (!fs.existsSync(indexHtmlPath)) {
    return res.status(503).send('Service temporarily unavailable: build not ready.');
  }
  res.sendFile(indexHtmlPath);
});

const port = process.env.PORT || 5173;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});


