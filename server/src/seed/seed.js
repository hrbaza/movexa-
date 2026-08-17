import mongoose from 'mongoose';
import User from '../models/User.js';
import Movie from '../models/Movie.js';
import Genre from '../models/Genre.js';
import { genres, movies, demoUsers } from './seedData.js';
import { slugify } from '../utils/helpers.js';
import { tmdbConfigured } from '../services/tmdb.js';
import { seedFromTmdb } from './seedFromTmdb.js';

/** Seed the bundled sample genres + movies (offline fallback). */
async function seedSampleData() {
  await Genre.insertMany(genres.map((g) => ({ ...g, slug: slugify(g.name) })));
  await Movie.insertMany(movies.map((m) => ({ ...m, slug: slugify(m.title, m.year) })));
}

/**
 * Seed the database if it's empty. Safe to call on every boot — it only runs
 * when there are no movies yet (fresh in-memory DB or empty Atlas DB).
 */
export async function seedDatabase({ force = false } = {}) {
  const existing = await Movie.estimatedDocumentCount();
  if (existing > 0 && !force) {
    console.log(`📦 Database already has ${existing} movies — skipping seed`);
    return;
  }

  if (force) {
    await Promise.all([Movie.deleteMany({}), Genre.deleteMany({}), User.deleteMany({})]);
  }

  console.log('🌱 Seeding database…');

  // Prefer live TMDB data when a key is configured; otherwise use bundled samples.
  if (tmdbConfigured()) {
    try {
      await seedFromTmdb();
    } catch (err) {
      console.warn(`⚠️  TMDB seeding failed (${err.message}) — falling back to sample data`);
      await seedSampleData();
    }
  } else {
    console.log('ℹ️  No TMDB_API_KEY set — seeding bundled sample movies. Add a key in server/.env for real TMDB data.');
    await seedSampleData();
  }

  // Demo users (hash passwords individually via the model)
  for (const u of demoUsers) {
    const user = new User({ name: u.name, email: u.email, role: u.role });
    await user.setPassword(u.password);
    await user.save();
  }

  const [gc, mc, uc] = await Promise.all([
    Genre.countDocuments(),
    Movie.countDocuments(),
    User.countDocuments(),
  ]);
  console.log(`✅ Seeded ${gc} genres, ${mc} movies, ${uc} users`);
  console.log('   Admin → admin@movexa.test / admin123');
  console.log('   User  → user@movexa.test / user123');
}

// Allow running `npm run seed` standalone (against a real MONGODB_URI).
if (import.meta.url === `file://${process.argv[1]}`) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI to seed a standalone database.');
    process.exit(1);
  }
  mongoose
    .connect(uri)
    .then(() => seedDatabase({ force: true }))
    .then(() => mongoose.disconnect())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
