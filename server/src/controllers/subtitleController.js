import { asyncHandler, httpError } from '../utils/helpers.js';

const WYZIE_API = 'https://sub.wyzie.io/search';

export const searchSubtitles = asyncHandler(async (req, res) => {
  const apiKey = String(process.env.WYZIE_API_KEY || '').trim();
  if (!apiKey) throw httpError(503, 'Subtitle service is not configured');

  const tmdbId = Number(req.params.tmdbId);
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) throw httpError(400, 'Invalid TMDB id');

  const language = String(req.query.language || '').trim().toLowerCase();
  if (language && !/^[a-z]{2}(,[a-z]{2})*$/.test(language)) {
    throw httpError(400, 'Invalid subtitle language');
  }

  const params = new URLSearchParams({
    id: String(tmdbId),
    format: 'srt,vtt',
    encoding: 'utf-8',
    key: apiKey,
  });
  if (language) params.set('language', language);

  const upstream = await fetch(`${WYZIE_API}?${params}`, {
    headers: { accept: 'application/json', 'user-agent': 'Movexa/1.0' },
    signal: AbortSignal.timeout(12000),
  });

  if (upstream.status === 401 || upstream.status === 403) {
    throw httpError(503, 'Subtitle API key is invalid');
  }
  if (upstream.status === 429) throw httpError(429, 'Subtitle request limit reached');
  if (!upstream.ok) throw httpError(502, `Subtitle service returned ${upstream.status}`);

  const data = await upstream.json();
  const items = (Array.isArray(data) ? data : [])
    .filter((item) => typeof item.url === 'string' && item.url.startsWith('https://'))
    .slice(0, 50)
    .map((item) => ({
      id: String(item.id || item.url),
      url: item.url,
      language: item.language || '',
      display: item.display || item.language || 'Subtitle',
      format: item.format || '',
      release: item.release || item.fileName || '',
      source: item.source || 'Wyzie',
      hearingImpaired: Boolean(item.isHearingImpaired),
      aiTranslated: Boolean(item.ai),
    }));

  res.json({ items });
});
