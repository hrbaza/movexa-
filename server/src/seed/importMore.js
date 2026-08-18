// One-off bulk importer — adds N NEW movies from TMDB to the existing catalog
// (dedupes against movies already present). Run against a real MONGODB_URI:
//   npm --prefix server run import:more -- 100
import 'dotenv/config';
import dns from 'node:dns';
import mongoose from 'mongoose';

// Some local resolvers intermittently refuse the Atlas SRV lookup — use reliable
// public DNS for this one-off script.
try {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch {
  /* ignore */
}
import Movie from '../models/Movie.js';
import Genre from '../models/Genre.js';
import { slugify } from '../utils/helpers.js';
import {
  tmdbConfigured,
  fetchGenreMap,
  fetchList,
  fetchMovieDetail,
  mapDetailToMovie,
  mapWithConcurrency,
} from '../services/tmdb.js';

async function main() {
  const target = Math.max(1, Math.min(500, Number(process.argv[2]) || 100));
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    console.error('❌ MONGODB_URI is required (set it in server/.env).');
    process.exit(1);
  }
  if (!tmdbConfigured()) {
    console.error('❌ TMDB_API_KEY is required (set it in server/.env).');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('🗄️  Connected. Reading existing catalog…');

  const existing = await Movie.find({}, 'tmdbId slug').lean();
  const haveIds = new Set(existing.filter((m) => m.tmdbId).map((m) => m.tmdbId));
  const haveSlugs = new Set(existing.map((m) => m.slug));
  console.log(`   Catalog has ${existing.length} movies. Looking for ${target} new ones…`);

  // Make sure all genres exist.
  const genreMap = await fetchGenreMap();
  await Genre.insertMany(
    [...genreMap.values()].map((name) => ({ name, slug: slugify(name) })),
    { ordered: false }
  ).catch(() => {});

  // Collect NEW tmdb ids from a broad mix of lists/pages until we hit the target.
  const newIds = [];
  const seen = new Set();
  const sources = [
    ['popular', 30],
    ['top_rated', 25],
    ['now_playing', 12],
    ['upcoming', 12],
    ['trending', 2],
  ];
  for (const [kind, maxPages] of sources) {
    for (let page = 1; page <= maxPages && newIds.length < target; page++) {
      let list;
      try {
        list = await fetchList(kind, page);
      } catch {
        break;
      }
      if (!list.length) break;
      for (const m of list) {
        if (newIds.length >= target) break;
        if (m.poster_path && !haveIds.has(m.id) && !seen.has(m.id)) {
          seen.add(m.id);
          newIds.push(m.id);
        }
      }
    }
    if (newIds.length >= target) break;
  }
  console.log(`   Found ${newIds.length} new titles. Fetching details from TMDB…`);

  // Fetch details + map to our schema.
  const details = await mapWithConcurrency(newIds, (id) => fetchMovieDetail(id), 8);
  const docs = details.map((d, i) => mapDetailToMovie(d, existing.length + i));

  // Guarantee unique slugs (vs existing + within this batch).
  for (const doc of docs) {
    if (haveSlugs.has(doc.slug)) doc.slug = `${doc.slug}-${doc.tmdbId}`;
    haveSlugs.add(doc.slug);
  }

  const before = await Movie.countDocuments();
  await Movie.insertMany(docs, { ordered: false }).catch((e) => {
    console.warn('   Some inserts were skipped:', e.message);
  });
  const after = await Movie.countDocuments();

  console.log(`✅ Imported ${after - before} new movies. Catalog total: ${after}.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
