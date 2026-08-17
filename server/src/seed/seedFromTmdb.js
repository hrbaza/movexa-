import Genre from '../models/Genre.js';
import Movie from '../models/Movie.js';
import { slugify } from '../utils/helpers.js';
import {
  fetchGenreMap,
  fetchList,
  fetchMovieDetail,
  mapDetailToMovie,
  mapWithConcurrency,
} from '../services/tmdb.js';

/**
 * Seed the catalog from live TMDB data. Pulls genres + a mix of trending /
 * top-rated / popular lists, fetches full details for each unique movie, and
 * stores them as Movie docs (real posters, backdrops, cast, trailers).
 *
 * How many movies? Controlled by TMDB_SEED_COUNT (default 100). Each movie is a
 * separate detail request, so a bigger number means a slower first boot.
 */
export async function seedFromTmdb() {
  const target = Math.max(1, Math.min(500, Number(process.env.TMDB_SEED_COUNT) || 100));
  console.log(`🎞️  Seeding ${target} movies from TMDB…`);

  // 1) Genres
  const genreMap = await fetchGenreMap();
  await Genre.insertMany(
    [...genreMap.values()].map((name) => ({ name, slug: slugify(name) })),
    { ordered: false }
  ).catch(() => {}); // ignore dup-key races

  // 2) Gather a unique set of movie ids from several lists until we hit `target`.
  const seen = new Map(); // id -> summary
  const trendingIds = new Set();

  const collect = async (kind, maxPages) => {
    for (let page = 1; page <= maxPages && seen.size < target; page++) {
      let list;
      try {
        list = await fetchList(kind, page);
      } catch {
        break;
      }
      if (!list.length) break;
      for (const m of list) {
        if (kind === 'trending') trendingIds.add(m.id);
        if (m.poster_path && !seen.has(m.id)) seen.set(m.id, m);
      }
    }
  };

  await collect('trending', 2); // ~40 recent hits (also flags them as trending)
  await collect('top_rated', 5); // ~100 acclaimed
  await collect('popular', 25); // fill the rest from popular (up to ~500)

  const ids = [...seen.keys()].slice(0, target);

  // 3) Fetch full detail for each and map to our schema.
  const details = await mapWithConcurrency(ids, (id) => fetchMovieDetail(id), 8);
  const docs = details.map((d, i) => {
    const movie = mapDetailToMovie(d, i);
    movie.trending = trendingIds.has(d.id);
    return movie;
  });

  // 4) Mark the most popular handful as "featured" for the hero carousel.
  docs
    .slice()
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6)
    .forEach((d) => (d.featured = true));

  await Movie.insertMany(docs, { ordered: false }).catch((e) => {
    console.warn('Some movies failed to insert:', e.message);
  });

  const count = await Movie.countDocuments();
  console.log(`✅ Imported ${count} movies from TMDB`);
  return count;
}
