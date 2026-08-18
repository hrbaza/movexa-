import mongoose from 'mongoose';

let memoryServer = null;

/**
 * Connect to MongoDB.
 * - If MONGODB_URI is set (e.g. MongoDB Atlas), connect to it directly.
 * - Otherwise spin up an in-memory MongoDB (mongodb-memory-server) so the app
 *   runs with zero local install. Data resets when the process stops.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  let uri = process.env.MONGODB_URI?.trim();

  if (uri) {
    console.log('🗄️  Connecting to MongoDB (external URI)…');
  } else {
    console.log('🗄️  No MONGODB_URI set — starting in-memory MongoDB…');
    // Indirect specifier so serverless bundlers (Vercel/nft) don't try to include
    // this dev-only dependency. Resolved at runtime from server/node_modules.
    const pkg = 'mongodb-memory-server';
    const { MongoMemoryServer } = await import(pkg);
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('movexa');
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
}

/**
 * Serverless-friendly connect (Vercel etc.). Caches the connection on the global
 * object so warm function invocations reuse it instead of opening a new one each
 * time (which would exhaust the Atlas connection limit). Requires MONGODB_URI.
 */
export async function connectServerless() {
  const g = globalThis;
  g._movexaMongoose = g._movexaMongoose || { conn: null, promise: null };
  const cache = g._movexaMongoose;

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) throw new Error('MONGODB_URI is required in a serverless environment');
    mongoose.set('strictQuery', true);
    cache.promise = mongoose.connect(uri, { maxPoolSize: 5 }).then((m) => m.connection);
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

export function isMemoryDB() {
  return Boolean(memoryServer);
}
