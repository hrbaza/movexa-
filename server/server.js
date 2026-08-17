import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { seedDatabase } from './src/seed/seed.js';

// Port resolution:
// - API_PORT (set in local .env) wins in dev, so a preview launcher injecting
//   PORT for the frontend can't hijack the API port.
// - PORT is used in production (Render/Railway/etc. inject it for the single service).
// - 5000 is the final fallback.
const PORT = process.env.API_PORT || process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`\n🎬 Movexa API running → http://localhost:${PORT}/api`);
      console.log(`   Health check      → http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

start();
