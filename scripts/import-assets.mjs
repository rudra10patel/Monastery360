import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import mime from 'mime-types';
import { MongoClient, GridFSBucket } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function* walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else {
      yield fullPath;
    }
  }
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const assetsDir = path.join(root, 'src', 'assets');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'monastery360';

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const bucket = new GridFSBucket(db, { bucketName: 'media' });

  let count = 0;
  for await (const filePath of walk(assetsDir)) {
    const rel = path.relative(assetsDir, filePath).replace(/\\/g, '/');
    const filename = rel;
    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    // Skip non-media like .docx
    if (!contentType.startsWith('image/') && !contentType.startsWith('audio/')) continue;

    // Check if exists by name
    const existing = await db.collection('media.files').findOne({ filename });
    if (existing) continue;

    await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, { metadata: { contentType } });
      fs.createReadStream(filePath)
        .on('error', reject)
        .pipe(uploadStream)
        .on('error', reject)
        .on('finish', resolve);
    });
    count++;
  }

  console.log(`Uploaded ${count} new media files to GridFS.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



