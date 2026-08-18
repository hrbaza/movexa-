// One-off: point every movie's videoUrl at a working, legally-streamable source
// (Creative-Commons / open movies). Run against a real MONGODB_URI:
//   npm --prefix server run fix:videos
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';
import Movie from '../models/Movie.js';

try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch {
  /* ignore */
}

const STREAMS = [
  'https://test-streams.mux.dev/tos_ismc/main.m3u8', // Tears of Steel (HLS, adaptive)
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Tears of Steel (HLS)
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', // Tears of Steel (HLS)
];

async function main() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error('❌ MONGODB_URI is required (set it in server/.env).');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const movies = await Movie.find({}, '_id').lean();
  const ops = movies.map((m, idx) => ({
    updateOne: {
      filter: { _id: m._id },
      update: { $set: { videoUrl: STREAMS[idx % STREAMS.length] } },
    },
  }));
  const res = await Movie.bulkWrite(ops);
  console.log(`✅ Updated videoUrl on ${res.modifiedCount} of ${movies.length} movies.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
