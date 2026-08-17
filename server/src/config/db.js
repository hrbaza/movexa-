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
    // Dynamic import so the (dev-only) dependency isn't required in production.
    const { MongoMemoryServer } = await import('mongodb-memory-server');
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

export function isMemoryDB() {
  return Boolean(memoryServer);
}
