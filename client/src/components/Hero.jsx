import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PosterImage from './PosterImage.jsx';
import TrailerModal from './TrailerModal.jsx';
import { Play, Plus, Check, Star } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWatchlist, useLibraryActions } from '../hooks/useLibrary.js';
import { formatRuntime, ratingColor } from '../utils/format.js';

export default function Hero({ movies = [] }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: watchlist } = useWatchlist();
  const { toggleWatchlist } = useLibraryActions();
  const [index, setIndex] = useState(0);
  const [trailer, setTrailer] = useState(null);

  const slides = movies.slice(0, 5);
  const movie = slides[index];

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000);
    return () => clearInterval(t);
  }, [slides.length]);

  if (!movie) return <div className="skeleton h-[75vh] w-full" />;

  const inWatchlist = Boolean(watchlist?.some((m) => m._id === movie._id));

  return (
    <section className="relative h-[80vh] min-h-[520px] w-full overflow-hidden bg-night">
      {/* Backdrop — always fully visible (no opacity animation), subtle slow zoom */}
      <PosterImage
        key={movie._id}
        movie={movie}
        variant="backdrop"
        loading="eager"
        fetchpriority="high"
        className="absolute inset-0 h-full w-full object-cover object-top motion-safe:animate-[kenburns_18s_ease-out_infinite_alternate]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-night/50" />

      {/* Content */}
      <div className="container-page relative flex h-full items-end pb-20 sm:items-center sm:pb-0">
        <div className="max-w-2xl animate-fade-in">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-light">
            Featured
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-6xl">
            {movie.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-white/90">
            <span className={`flex items-center gap-1 ${ratingColor(movie.rating)}`}>
              <Star width={16} height={16} /> {movie.rating?.toFixed(1)}
            </span>
            <span>{movie.year}</span>
            {movie.runtime > 0 && <span>{formatRuntime(movie.runtime)}</span>}
            <span className="rounded border border-white/30 px-1.5 py-0.5 text-xs">{movie.contentRating}</span>
            <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-bold">{movie.quality}</span>
          </div>

          <p className="mt-4 line-clamp-3 max-w-xl text-sm text-white/90 [text-shadow:_0_1px_10px_rgba(0,0,0,0.9)] sm:text-base">
            {movie.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {movie.genres?.slice(0, 3).map((g) => (
              <span key={g} className="chip">{g}</span>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate(isAuthenticated ? `/watch/${movie.slug}` : '/login')}
              className="btn-primary px-6 py-3 text-base"
            >
              <Play width={20} height={20} /> Play
            </button>
            {movie.trailer && (
              <button onClick={() => setTrailer(movie.trailer)} className="btn-ghost px-5 py-3 text-base">
                Watch Trailer
              </button>
            )}
            <button
              onClick={() => (isAuthenticated ? toggleWatchlist.mutate({ movieId: movie._id, active: inWatchlist }) : navigate('/login'))}
              className="btn-outline px-5 py-3 text-base"
            >
              {inWatchlist ? <Check width={20} height={20} /> : <Plus width={20} height={20} />}
              {inWatchlist ? 'In Watchlist' : 'Watchlist'}
            </button>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 sm:left-auto sm:right-10 sm:translate-x-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-brand' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {trailer && <TrailerModal videoId={trailer} title={movie.title} onClose={() => setTrailer(null)} />}
    </section>
  );
}
