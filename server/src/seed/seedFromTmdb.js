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
 * Seed the catalog from live TMDB data. Pulls genres + popular/top-rated/trending
 * lists, fetches full details for each unique movie, and stores them as Movie docs
 * (real posters, backdrops, cast, trailers). Returns the number of movies inserted.
 */
export async function seedFromTmdb() {
  console.log('🎞️  Seeding from TMDB…');

  // 1) Genres
  const genreMap = await fetchGenreMap();
  await Genre.insertMany(
    [...genreMap.values()].map((name) => ({ name, slug: slugify(name) })),
    { ordered: false }
  ).catch(() => {}); // ignore dup key races

  // 2) Collect a unique set of movie ids from a few curated lists.
  const [popular1, popular2, topRated, trending] = await Promise.all([
    fetchList('popular', 1),
    fetchList('popular', 2),
    fetchList('top_rated', 1),
    fetchList('trending', 1),
  ]);

  const trendingIds = new Set(trending.map((m) => m.id));
  const seen = new Map(); // id -> summary
  for (const m of [...trending, ...popular1, ...topRated, ...popular2]) {
    if (!seen.has(m.id) && m.poster_path) seen.set(m.id, m);
  }
  const ids = [...seen.keys()].slice(0, 48);

  // 3) Fetch full detail for each and map to our schema.
  const details = await mapWithConcurrency(ids, (id) => fetchMovieDetail(id), 6);
  const docs = details.map((d, i) => {
    const movie = mapDetailToMovie(d, i);
    movie.trending = trendingIds.has(d.id);
    return movie;
  });

  // 4) Mark the most popular handful as "featured" for the hero.
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
