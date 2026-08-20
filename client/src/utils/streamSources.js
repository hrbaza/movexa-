export const STREAM_SOURCES = [
  {
    id: 'videasy',
    label: 'Videasy',
    movieUrl: (tmdbId) => `https://player.videasy.to/movie/${tmdbId}?overlay=true`,
  },
  {
    id: 'vidsrc',
    label: 'VidSrc',
    movieUrl: (tmdbId) => `https://vsembed.su/embed/movie/${tmdbId}`,
  },
  {
    id: 'vidking',
    label: 'VidKing',
    movieUrl: (tmdbId) => `https://www.vidking.net/embed/movie/${tmdbId}?autoPlay=true`,
  },
];

export function getStreamSource(sourceId) {
  return STREAM_SOURCES.find((source) => source.id === sourceId) || STREAM_SOURCES[0];
}

export function getMovieStreamUrl(sourceId, tmdbId) {
  const numericId = Number(tmdbId);
  if (!Number.isInteger(numericId) || numericId <= 0) return '';
  return getStreamSource(sourceId).movieUrl(numericId);
}
