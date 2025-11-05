import { MongoClient } from 'mongodb';

let cached = global._adminStatsDbCache;
if (!cached) {
  cached = global._adminStatsDbCache = { client: null, db: null };
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
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }
  try {
    const db = await getDb();
    const coll = db.collection('admin_events');
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [counts, recent, activeUsersAgg] = await Promise.all([
      coll.aggregate([
        { $match: { ts: { $gte: since } } },
        { $group: { _id: '$eventName', count: { $sum: 1 } } }
      ]).toArray(),
      coll.find({}).sort({ ts: -1 }).limit(50).toArray(),
      coll.aggregate([
        { $match: { ts: { $gte: new Date(Date.now() - 15 * 60 * 1000) } } },
        { $group: { _id: '$user', lastSeen: { $max: '$ts' }, count: { $sum: 1 } } },
        { $sort: { lastSeen: -1 } }
      ]).toArray()
    ]);

    const countsMap = counts.reduce((acc, c) => { acc[c._id || 'unknown'] = c.count; return acc; }, {});

    res.status(200).json({
      success: true,
      window: { since },
      counts: countsMap,
      recent,
      activeUsers: activeUsersAgg.filter(u => u._id).map(u => ({ user: u._id, lastSeen: u.lastSeen, events: u.count }))
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}


