import { MongoClient } from 'mongodb';

let cached = global._adminDbCache;
if (!cached) {
  cached = global._adminDbCache = { client: null, db: null };
}

async function getDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'unified_medical_ai_groq';
  if (!uri) throw new Error('MONGODB_URI not set');

  if (cached.client && cached.db) return cached.db;
  const client = new MongoClient(uri, {});
  await client.connect();
  const db = client.db(dbName);
  cached.client = client;
  cached.db = db;
  return db;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  try {
    const db = await getDb();
    const { eventName, payload, ts } = req.body || {};
    if (!eventName) {
      res.status(400).json({ success: false, error: 'eventName required' });
      return;
    }
    const doc = {
      eventName,
      payload: payload || {},
      ts: ts ? new Date(ts) : new Date(),
      user: payload?.user || null,
      ua: req.headers['user-agent'] || null,
      ip: (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString(),
      createdAt: new Date()
    };
    await db.collection('admin_events').insertOne(doc);
    res.status(200).json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}


