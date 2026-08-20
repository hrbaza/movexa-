import { Link, useNavigate } from 'react-router-dom';
import PosterImage from './PosterImage.jsx';
import { Play, Plus, Check, Star } from './Icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWatchlist, useLibraryActions } from '../hooks/useLibrary.js';
import { ratingColor } from '../utils/format.js';

export default function MovieCard({ movie, progress }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: watchlist } = useWatchlist();
  const { toggleWatchlist } = useLibraryActions();

  const inWatchlist = Boolean(watchlist?.some((m) => m._id === movie._id));
  const isExternal = Boolean(movie.external && movie.tmdbId);
  const target = isExternal ? `/watch/tmdb/${movie.tmdbId}` : `/movie/${movie.slug}`;

  const onWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isExternal) return navigate(isAuthenticated ? target : '/login');
    if (!isAuthenticated) return navigate('/login');
    toggleWatchlist.mutate({ movieId: movie._id, active: inWatchlist });
  };

  const onPlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(isAuthenticated ? (isExternal ? target : `/watch/${movie.slug}`) : '/login');
  };

  return (
    <Link
      to={isAuthenticated || !isExternal ? target : '/login'}
      className="group relative block overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-white/5 transition-transform duration-300 hover:z-10 hover:scale-[1.04] hover:ring-white/20"
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <PosterImage
          movie={movie}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />
        {/* top badges */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
          {movie.quality && (
            <span className="rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white backdrop-blur">
              {movie.quality}
            </span>
          )}
          {movie.rating > 0 && (
            <span className={`flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold backdrop-blur ${ratingColor(movie.rating)}`}>
              <Star width={10} height={10} /> {movie.rating.toFixed(1)}
            </span>
          )}
        </div>

        {/* hover overlay */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex items-center gap-2 p-3">
            <button
              onClick={onPlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-glow transition hover:bg-brand-light"
              aria-label="Play"
            >
              <Play width={18} height={18} />
            </button>
            {!isExternal && (
              <button
                onClick={onWatchlist}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur transition hover:bg-white/20"
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {inWatchlist ? <Check width={18} height={18} /> : <Plus width={18} height={18} />}
              </button>
            )}
          </div>
        </div>

        {/* continue-watching progress bar */}
        {progress > 0 && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="truncate text-sm font-semibold text-white">{movie.title}</h3>
        <p className="mt-0.5 truncate text-xs text-muted">
          {movie.year} · {movie.genres?.[0] || 'Film'}
        </p>
      </div>
    </Link>
  );
}
