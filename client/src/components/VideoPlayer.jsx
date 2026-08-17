import { useRef, useState, useEffect, useCallback } from 'react';
import { Play, Pause, Volume, VolumeMute, Fullscreen, Settings, ChevronLeft } from './Icons.jsx';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];
const QUALITIES = ['Auto', '1080p', '720p', '480p', '360p'];

function fmt(t) {
  if (!Number.isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function VideoPlayer({ src, poster, title, startAt = 0, onProgress, onEnded, onBack }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideTimer = useRef(null);
  const lastSaved = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [quality, setQuality] = useState('Auto');
  const [showControls, setShowControls] = useState(true);
  const [menu, setMenu] = useState(null); // 'speed' | 'quality' | null
  const [buffering, setBuffering] = useState(false);

  // Resume from a saved position once metadata is ready.
  const onLoadedMeta = () => {
    const v = videoRef.current;
    setDuration(v.duration);
    if (startAt > 0 && startAt < v.duration - 5) v.currentTime = startAt;
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const onTimeUpdate = () => {
    const v = videoRef.current;
    setCurrent(v.currentTime);
    // Throttle progress saves to ~ every 5s.
    if (onProgress && v.duration && v.currentTime - lastSaved.current > 5) {
      lastSaved.current = v.currentTime;
      onProgress({ position: Math.floor(v.currentTime), duration: Math.floor(v.duration) });
    }
  };

  const seek = (e) => {
    const v = videoRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
    setCurrent(v.currentTime);
  };

  const changeVolume = (val) => {
    const v = videoRef.current;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(val === 0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const togglePiP = async () => {
    try {
      const v = videoRef.current;
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await v.requestPictureInPicture();
    } catch {
      /* PiP not supported */
    }
  };

  const revealControls = useCallback(() => {
    setShowControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setShowControls(false);
    }, 3000);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const v = videoRef.current;
      if (!v) return;
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          v.currentTime = Math.min(v.duration, v.currentTime + 10);
          break;
        case 'ArrowLeft':
          v.currentTime = Math.max(0, v.currentTime - 10);
          break;
        case 'ArrowUp':
          changeVolume(Math.min(1, v.volume + 0.1));
          break;
        case 'ArrowDown':
          changeVolume(Math.max(0, v.volume - 0.1));
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        default:
      }
      revealControls();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, revealControls]);

  const applySpeed = (s) => {
    videoRef.current.playbackRate = s;
    setSpeed(s);
    setMenu(null);
  };

  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full select-none overflow-hidden bg-black"
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full"
        onClick={togglePlay}
        onLoadedMetadata={onLoadedMeta}
        onTimeUpdate={onTimeUpdate}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
      />

      {/* Buffering spinner */}
      {buffering && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-brand" />
        </div>
      )}

      {/* Center play button when paused */}
      {!playing && !buffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 grid place-items-center bg-black/30 transition"
          aria-label="Play"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full bg-brand/90 text-white shadow-glow transition hover:scale-105">
            <Play width={36} height={36} />
          </span>
        </button>
      )}

      {/* Top bar */}
      <div
        className={`absolute inset-x-0 top-0 flex items-center gap-3 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {onBack && (
          <button onClick={onBack} className="rounded-full bg-black/40 p-2 text-white transition hover:bg-white/20" aria-label="Back">
            <ChevronLeft />
          </button>
        )}
        <h2 className="truncate text-sm font-semibold text-white sm:text-base">{title}</h2>
      </div>

      {/* Bottom controls */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-3 pt-10 transition-opacity sm:px-4 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div className="group/seek mb-2 cursor-pointer py-1.5" onClick={seek}>
          <div className="relative h-1 rounded-full bg-white/25 transition-all group-hover/seek:h-1.5">
            <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${pct}%` }} />
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand opacity-0 shadow transition group-hover/seek:opacity-100"
              style={{ left: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 text-white">
          <button onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause width={22} height={22} /> : <Play width={22} height={22} />}
          </button>

          {/* Volume */}
          <div className="group/vol flex items-center gap-2">
            <button onClick={toggleMute} aria-label="Mute">
              {muted || volume === 0 ? <Volume width={22} height={22} className="text-muted" /> : <Volume width={22} height={22} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="h-1 w-0 cursor-pointer appearance-none rounded-full bg-white/30 opacity-0 transition-all group-hover/vol:w-20 group-hover/vol:opacity-100 accent-brand sm:w-16 sm:opacity-100"
            />
          </div>

          <span className="text-xs font-medium tabular-nums text-white/90">
            {fmt(current)} <span className="text-muted">/ {fmt(duration)}</span>
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Settings menu (speed + quality) */}
            <div className="relative">
              <button onClick={() => setMenu(menu ? null : 'root')} aria-label="Settings">
                <Settings width={20} height={20} />
              </button>
              {menu && (
                <div className="absolute bottom-10 right-0 w-44 overflow-hidden rounded-lg border border-white/10 bg-elevated/95 text-sm shadow-card backdrop-blur">
                  {menu === 'root' && (
                    <>
                      <MenuRow label="Speed" value={speed === 1 ? 'Normal' : `${speed}x`} onClick={() => setMenu('speed')} />
                      <MenuRow label="Quality" value={quality} onClick={() => setMenu('quality')} />
                    </>
                  )}
                  {menu === 'speed' &&
                    SPEEDS.map((s) => (
                      <Option key={s} active={s === speed} label={s === 1 ? 'Normal' : `${s}x`} onClick={() => applySpeed(s)} />
                    ))}
                  {menu === 'quality' &&
                    QUALITIES.map((qn) => (
                      <Option key={qn} active={qn === quality} label={qn} onClick={() => { setQuality(qn); setMenu(null); }} />
                    ))}
                </div>
              )}
            </div>

            <button onClick={togglePiP} className="hidden sm:block" aria-label="Picture in picture">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="15" rx="2" /><rect x="12" y="11" width="7" height="6" rx="1" fill="currentColor" />
              </svg>
            </button>

            <button onClick={toggleFullscreen} aria-label="Fullscreen">
              <Fullscreen width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuRow({ label, value, onClick }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between px-3 py-2.5 text-white/90 transition hover:bg-white/10">
      <span>{label}</span>
      <span className="text-xs text-muted">{value} ›</span>
    </button>
  );
}
function Option({ label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center justify-between px-3 py-2.5 transition hover:bg-white/10 ${active ? 'text-brand-light' : 'text-white/90'}`}>
      <span>{label}</span>
      {active && <span>✓</span>}
    </button>
  );
}
