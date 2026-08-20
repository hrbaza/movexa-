import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Fullscreen } from './Icons.jsx';
import { getMovieStreamUrl, getStreamSource, STREAM_SOURCES } from '../utils/streamSources.js';
import { subtitleApi } from '../services/endpoints.js';

const SOURCE_KEY = 'movexa_stream_source';

export default function StreamEmbedPlayer({ tmdbId, title, onBack }) {
  const containerRef = useRef(null);
  const [sourceId, setSourceId] = useState(() => localStorage.getItem(SOURCE_KEY) || STREAM_SOURCES[0].id);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState('en');
  const [subtitles, setSubtitles] = useState([]);
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [subtitleError, setSubtitleError] = useState('');
  const source = getStreamSource(sourceId);
  const src = getMovieStreamUrl(source.id, tmdbId);

  useEffect(() => {
    localStorage.setItem(SOURCE_KEY, source.id);
    setLoading(true);
  }, [source.id, tmdbId, reloadKey]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const loadSubtitles = async (language = subtitleLanguage) => {
    setSubtitleLoading(true);
    setSubtitleError('');
    try {
      const result = await subtitleApi.search(tmdbId, language);
      setSubtitles(result.items || []);
      if (!result.items?.length) setSubtitleError('No subtitles found for this language.');
    } catch (error) {
      setSubtitles([]);
      setSubtitleError(error.message);
    } finally {
      setSubtitleLoading(false);
    }
  };

  const toggleSubtitles = () => {
    const next = !showSubtitles;
    setShowSubtitles(next);
    if (next && subtitles.length === 0 && !subtitleLoading) loadSubtitles();
  };

  return (
    <div ref={containerRef} className="relative aspect-video w-full overflow-hidden bg-black">
      <iframe
        key={`${source.id}-${tmdbId}-${reloadKey}`}
        src={src}
        title={`${title} — ${source.label} player`}
        className="h-full w-full border-0"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="origin"
        onLoad={() => setLoading(false)}
      />

      <div className="absolute inset-x-0 top-0 flex items-center gap-2 bg-gradient-to-b from-black/90 to-transparent p-3">
        <button onClick={onBack} className="rounded-full bg-black/60 p-2 text-white hover:bg-white/20" aria-label="Back">
          <ChevronLeft />
        </button>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{title}</span>
        <select
          value={source.id}
          onChange={(event) => setSourceId(event.target.value)}
          className="rounded-lg border border-white/20 bg-black/80 px-2 py-1.5 text-xs text-white outline-none"
          aria-label="Streaming source"
        >
          {STREAM_SOURCES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <button
          onClick={toggleSubtitles}
          className="rounded-lg border border-white/20 bg-black/80 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/20"
          aria-label="Subtitles"
        >
          CC
        </button>
        <button onClick={toggleFullscreen} className="rounded-full bg-black/60 p-2 text-white hover:bg-white/20" aria-label="Fullscreen">
          <Fullscreen width={20} height={20} />
        </button>
      </div>

      {showSubtitles && (
        <div className="absolute right-3 top-14 z-20 w-[min(24rem,calc(100%-1.5rem))] overflow-hidden rounded-xl border border-white/15 bg-black/95 text-white shadow-card backdrop-blur">
          <div className="flex items-center gap-2 border-b border-white/10 p-3">
            <strong className="text-sm">Wyzie subtitles</strong>
            <select
              value={subtitleLanguage}
              onChange={(event) => {
                const language = event.target.value;
                setSubtitleLanguage(language);
                loadSubtitles(language);
              }}
              className="ml-auto rounded border border-white/20 bg-elevated px-2 py-1 text-xs"
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
            <button onClick={() => setShowSubtitles(false)} className="px-1 text-lg text-muted" aria-label="Close">×</button>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {subtitleLoading && <p className="p-4 text-center text-sm text-muted">Finding subtitles…</p>}
            {!subtitleLoading && subtitleError && <p className="p-4 text-center text-sm text-muted">{subtitleError}</p>}
            {!subtitleLoading && subtitles.map((subtitle) => (
              <a
                key={subtitle.id}
                href={subtitle.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg p-2.5 transition hover:bg-white/10"
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  {subtitle.display}
                  {subtitle.hearingImpaired && <span className="text-[10px] text-brand-light">HI</span>}
                  {subtitle.aiTranslated && <span className="text-[10px] text-brand-light">AI</span>}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {subtitle.release || subtitle.source} · {subtitle.format.toUpperCase()}
                </span>
              </a>
            ))}
          </div>
          <p className="border-t border-white/10 px-3 py-2 text-[10px] text-muted">
            Open a subtitle file here; use the embedded player's CC menu for in-player captions.
          </p>
        </div>
      )}

      {loading && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black">
          <div className="text-center">
            <div className="mx-auto h-11 w-11 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
            <p className="mt-3 text-sm text-muted">Loading {source.label}…</p>
          </div>
        </div>
      )}

      <button
        onClick={() => setReloadKey((key) => key + 1)}
        className="absolute bottom-3 right-3 rounded-lg bg-black/70 px-3 py-1.5 text-xs text-white/90 hover:bg-white/20"
      >
        Reload player
      </button>
    </div>
  );
}
