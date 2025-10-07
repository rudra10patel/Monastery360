import 'dotenv/config';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const root = path.resolve(__dirname, '..');
  const datasetPath = path.join(root, 'src', 'data', 'monasteries.ts');

  // Build-time import: use ts-node/tsup normally; here we rely on Vite build output not being available.
  // Instead, read the TS as ESM by using dynamic transpile via vite-node is overkill.
  // We'll fallback to a simple regex extraction by bundling with esbuild in-memory.
  const esbuild = await import('esbuild');
  const result = await esbuild.build({
    entryPoints: [datasetPath],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
  });
  const js = new TextDecoder().decode(result.outputFiles[0].contents);

  // Evaluate the module in a vm-like loader
  const tmpUrl = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
  const mod = await import(tmpUrl);
  const monasteries = mod.monasteries || [];

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'monastery360';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection('monasteries');

  let upserts = 0;
  for (const m of monasteries) {
    // Replace local image paths with API media URLs
    const images = Array.isArray(m.images) ? m.images.map((p) => {
      const name = p.split('/').pop();
      return name ? `/api/media/${name}` : p;
    }) : [];
    await col.updateOne(
      { id: m.id },
      { $set: { ...m, images } },
      { upsert: true }
    );
    upserts++;
  }

  console.log(`Upserted ${upserts} monasteries.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



