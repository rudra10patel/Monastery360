import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawnSync } from 'child_process';
import { Readable } from 'stream';
import { getCollections, getBucket } from './db.js';
// Node 18+ has global fetch; for older Node, consider importing 'node-fetch'.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));
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

// Monasteries API
app.get('/api/monasteries', async (_req, res) => {
  try {
    const { monasteries } = await getCollections();
    const docs = await monasteries.find({}).toArray();
    res.json(docs);
  } catch (err) {
    console.error('List monasteries error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

app.get('/api/monasteries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { monasteries } = await getCollections();
    const doc = await monasteries.findOne({ id });
    if (!doc) return res.status(404).json({ error: 'not_found' });
    res.json(doc);
  } catch (err) {
    console.error('Get monastery error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Media streaming via GridFS
app.get('/api/media/:filename', async (req, res) => {
  try {
    const bucket = await getBucket();
    const filename = req.params.filename;
    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.on('file', (file) => {
      const contentType = file?.metadata?.contentType || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    });

    downloadStream.on('error', (err) => {
      if (String(err?.message || '').includes('FileNotFound')) {
        return res.status(404).json({ error: 'not_found' });
      }
      console.error('GridFS download error', err);
      return res.status(500).json({ error: 'internal_error' });
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error('Media route error', err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Gemini chat proxy endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (!apiKey) {
      return res.status(501).json({ error: 'GEMINI_API_KEY not configured' });
    }

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Convert simple {role, content} messages to Gemini contents
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.content || '') }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ error: 'Gemini API error', details: text });
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const text = parts.map((p) => p.text).filter(Boolean).join('\n');
    return res.json({ text: text || '' });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Gemini proxy error', err);
    return res.status(500).json({ error: 'internal_error' });
  }
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


