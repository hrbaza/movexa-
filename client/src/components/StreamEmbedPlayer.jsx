import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Fullscreen } from './Icons.jsx';
import { getMovieStreamUrl, getStreamSource, STREAM_SOURCES } from '../utils/streamSources.js';

const SOURCE_KEY = 'movexa_stream_source';

export default function StreamEmbedPlayer({ tmdbId, title, onBack }) {
  const containerRef = useRef(null);
  const [sourceId, setSourceId] = useState(() => localStorage.getItem(SOURCE_KEY) || STREAM_SOURCES[0].id);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
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
        <button onClick={toggleFullscreen} className="rounded-full bg-black/60 p-2 text-white hover:bg-white/20" aria-label="Fullscreen">
          <Fullscreen width={20} height={20} />
        </button>
      </div>

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
