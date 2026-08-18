// TMDB (The Movie Database) integration.
// Reads credentials from env — the key NEVER leaves the server.
//   TMDB_API_KEY        → v3 API key (32-char hex)  OR  v4 read access token (JWT)
// Get a free key at https://www.themoviedb.org/settings/api
//
// Uses Node's built-in global fetch (Node 18+).

import { slugify } from '../utils/helpers.js';

const API = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

// Creative-Commons demo streams (TMDB provides metadata only — no video sources).
// Legally streamable demo content (Creative-Commons / open movies). HLS streams
// (.m3u8) are played via hls.js on the client; the rest are progressive MP4.
const DEMO_VIDEOS = [
  'https://test-streams.mux.dev/tos_ismc/main.m3u8', // Tears of Steel (HLS, adaptive)
  'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Tears of Steel (HLS)
  'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8', // Tears of Steel (HLS)
];

function getKey() {
  return (process.env.TMDB_API_KEY || '').trim();
}

export function tmdbConfigured() {
  return getKey().length > 0;
}

/** Low-level GET against the TMDB API with the right auth style. */
async function tmdbGet(path, params = {}) {
  const key = getKey();
  if (!key) throw new Error('TMDB_API_KEY is not configured');

  const url = new URL(API + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) url.searchParams.set(k, v);
  }

  const headers = { accept: 'application/json' };
  // A v4 token is a JWT (has dots); a v3 key goes in the query string.
  if (key.includes('.')) headers.Authorization = `Bearer ${key}`;
  else url.searchParams.set('api_key', key);

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`TMDB ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

export const imageUrl = (path, size = 'w500') => (path ? `${IMG}/${size}${path}` : '');

/** Fetch the movie genre id→name map. */
export async function fetchGenreMap() {
  const data = await tmdbGet('/genre/movie/list', { language: 'en-US' });
  const map = new Map();
  for (const g of data.genres || []) map.set(g.id, g.name);
  return map;
}

export async function fetchList(kind = 'popular', page = 1) {
  const path =
    kind === 'trending' ? '/trending/movie/week' : `/movie/${kind}`; // popular | top_rated | now_playing | upcoming
  const data = await tmdbGet(path, { language: 'en-US', page });
  return data.results || [];
}

export async function searchMovies(query, page = 1) {
  const data = await tmdbGet('/search/movie', {
    query,
    language: 'en-US',
    page,
    include_adult: false,
  });
  return (data.results || []).map((m) => ({
    tmdbId: m.id,
    title: m.title,
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    overview: m.overview,
    poster: imageUrl(m.poster_path, 'w342'),
    rating: m.vote_average ? Math.round(m.vote_average * 10) / 10 : 0,
  }));
}

/** Fetch full detail (credits + videos + certification) for one movie. */
export async function fetchMovieDetail(tmdbId) {
  return tmdbGet(`/movie/${tmdbId}`, {
    language: 'en-US',
    append_to_response: 'credits,videos,release_dates',
  });
}

function pickTrailer(videos) {
  const list = videos?.results || [];
  const yt = list.filter((v) => v.site === 'YouTube');
  const best =
    yt.find((v) => v.type === 'Trailer' && v.official) ||
    yt.find((v) => v.type === 'Trailer') ||
    yt.find((v) => v.type === 'Teaser') ||
    yt[0];
  return best?.key || '';
}

function pickCertification(releaseDates) {
  const us = (releaseDates?.results || []).find((r) => r.iso_3166_1 === 'US');
  const cert = us?.release_dates?.find((d) => d.certification)?.certification;
  return cert || 'NR';
}

function qualityFor(year) {
  if (year >= 2018) return '4K';
  if (year >= 2008) return 'FHD';
  return 'HD';
}

/**
 * Map a TMDB detail response to our Movie document shape.
 * `index` seeds the demo video rotation.
 */
export function mapDetailToMovie(d, index = 0) {
  const year = d.release_date ? Number(d.release_date.slice(0, 4)) : undefined;
  const genres = (d.genres || []).map((g) => g.name);
  const cast = (d.credits?.cast || [])
    .slice(0, 10)
    .map((c) => ({ name: c.name, character: c.character || '', photo: imageUrl(c.profile_path, 'w185') }));
  const director = (d.credits?.crew || []).find((c) => c.job === 'Director')?.name || '';

  return {
    tmdbId: d.id,
    title: d.title,
    slug: slugify(d.title, year || ''),
    description: d.overview || '',
    poster: imageUrl(d.poster_path, 'w500'),
    backdrop: imageUrl(d.backdrop_path, 'w1280'),
    trailer: pickTrailer(d.videos),
    videoUrl: DEMO_VIDEOS[index % DEMO_VIDEOS.length],
    releaseDate: d.release_date ? new Date(d.release_date) : undefined,
    year,
    runtime: d.runtime || 0,
    genres,
    cast,
    director,
    language: (d.spoken_languages?.[0]?.english_name) || 'English',
    country: (d.production_countries?.[0]?.name) || 'USA',
    rating: d.vote_average ? Math.round(d.vote_average * 10) / 10 : 0,
    contentRating: pickCertification(d.release_dates),
    quality: qualityFor(year || 2000),
    popularity: d.popularity || 0,
    views: Math.floor((d.vote_count || 0) / 5),
    type: 'movie',
    streamingStatus: 'available',
    published: true,
  };
}

/** Simple promise-pool so we don't hammer TMDB with 50 parallel requests. */
export async function mapWithConcurrency(items, worker, concurrency = 5) {
  const results = [];
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      try {
        results[idx] = await worker(items[idx], idx);
      } catch (err) {
        results[idx] = null;
        console.warn('TMDB fetch failed:', err.message);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results.filter(Boolean);
}
