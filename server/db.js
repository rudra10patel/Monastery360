import { MongoClient, GridFSBucket } from 'mongodb';

let client;
let database;
let gridfsBucket;

export async function getDb() {
  if (database) return database;
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB || 'monastery360';
  if (!client) {
    client = new MongoClient(uri, { maxPoolSize: 10 });
    await client.connect();
  }
  database = client.db(dbName);
  return database;
}

export async function getBucket() {
  if (gridfsBucket) return gridfsBucket;
  const db = await getDb();
  gridfsBucket = new GridFSBucket(db, { bucketName: 'media' });
  return gridfsBucket;
}

export async function getCollections() {
  const db = await getDb();
  return {
    monasteries: db.collection('monasteries')
  };
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
    gridfsBucket = undefined;
  }
}



