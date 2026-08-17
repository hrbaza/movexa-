import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi } from '../services/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLibraryStatus, useLibraryActions } from '../hooks/useLibrary.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import PosterImage from '../components/PosterImage.jsx';
import CastAvatar from '../components/CastAvatar.jsx';
import MovieRow from '../components/MovieRow.jsx';
import TrailerModal from '../components/TrailerModal.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import { Play, Plus, Check, Heart, Star } from '../components/Icons.jsx';
import { formatRuntime, ratingColor, formatViews } from '../utils/format.js';

export default function MovieDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [trailer, setTrailer] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => movieApi.get(slug),
  });

  const movie = data?.movie;
  const { data: status } = useLibraryStatus(movie?._id);
  const { toggleWatchlist, toggleFavorite } = useLibraryActions();
  useDocumentTitle(movie ? `${movie.title}${movie.year ? ` (${movie.year})` : ''}` : 'Movie');

  if (isLoading) return <PageLoader />;
  if (isError || !movie)
    return (
      <div className="container-page grid min-h-[60vh] place-items-center pt-24 text-center">
        <div>
          <p className="text-lg text-muted">Movie not found.</p>
          <Link to="/movies" className="btn-primary mt-4">Browse movies</Link>
        </div>
      </div>
    );

  const inWatchlist = status?.inWatchlist;
  const inFavorites = status?.inFavorites;
  const progress = status?.progress;

  const requireAuth = (fn) => () => (isAuthenticated ? fn() : navigate('/login'));

  return (
    <div>
      {/* Backdrop header */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
        <PosterImage movie={movie} variant="backdrop" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-night/90 to-transparent" />
      </div>

      <div className="container-page relative z-10 -mt-56 pb-10 sm:-mt-64">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Poster */}
          <div className="mx-auto w-44 shrink-0 sm:w-56 md:mx-0">
            <PosterImage movie={movie} className="w-full rounded-2xl shadow-card ring-1 ring-white/10" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-display text-3xl font-extrabold sm:text-5xl">{movie.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-white/90">
              <span className={`flex items-center gap-1 ${ratingColor(movie.rating)}`}>
                <Star width={16} height={16} /> {movie.rating?.toFixed(1)}
              </span>
              {movie.userRatingCount > 0 && (
                <span className="text-muted">({movie.userRatingAvg.toFixed(1)} user · {movie.userRatingCount})</span>
              )}
              <span>{movie.year}</span>
              {movie.runtime > 0 && <span>{formatRuntime(movie.runtime)}</span>}
              <span className="rounded border border-white/30 px-1.5 py-0.5 text-xs">{movie.contentRating}</span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs font-bold">{movie.quality}</span>
              <span className="text-muted">{formatViews(movie.views)} views</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {movie.genres?.map((g) => (
                <Link key={g} to={`/genre/${g.toLowerCase()}`} className="chip">{g}</Link>
              ))}
            </div>

            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
              {movie.description}
            </p>

            {/* Meta grid */}
            <dl className="mt-5 grid max-w-xl grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <Meta label="Director" value={movie.director} />
              <Meta label="Language" value={movie.language} />
              <Meta label="Country" value={movie.country} />
              <Meta label="Release" value={movie.year} />
            </dl>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button onClick={() => navigate(isAuthenticated ? `/watch/${movie.slug}` : '/login')} className="btn-primary px-6 py-3 text-base">
                <Play width={20} height={20} />
                {progress?.completion > 0 && progress.completion < 95 ? 'Resume' : 'Play'}
              </button>
              {movie.trailer && (
                <button onClick={() => setTrailer(true)} className="btn-ghost px-5 py-3 text-base">Trailer</button>
              )}
              <button
                onClick={requireAuth(() => toggleWatchlist.mutate({ movieId: movie._id, active: inWatchlist }))}
                className={`btn px-4 py-3 text-base ${inWatchlist ? 'bg-white/20 text-white' : 'btn-outline'}`}
              >
                {inWatchlist ? <Check width={20} height={20} /> : <Plus width={20} height={20} />}
                {inWatchlist ? 'In Watchlist' : 'Watchlist'}
              </button>
              <button
                onClick={requireAuth(() => toggleFavorite.mutate({ movieId: movie._id, active: inFavorites }))}
                className={`btn px-4 py-3 text-base ${inFavorites ? 'bg-brand/20 text-brand-light ring-1 ring-brand/40' : 'btn-outline'}`}
                aria-label="Favorite"
              >
                <Heart width={20} height={20} className={inFavorites ? 'fill-current' : ''} />
              </button>
            </div>

            {progress?.completion > 0 && progress.completion < 95 && (
              <div className="mt-4 max-w-xs">
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>Continue watching</span><span>{progress.completion}%</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/15">
                  <div className="h-full bg-brand" style={{ width: `${progress.completion}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cast */}
        {movie.cast?.length > 0 && (
          <section className="mt-12">
            <h2 className="section-title mb-4">Cast</h2>
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
              {movie.cast.map((c, i) => (
                <div key={i} className="w-24 shrink-0 text-center">
                  <CastAvatar person={c} />
                  <p className="mt-2 truncate text-sm font-semibold">{c.name}</p>
                  <p className="truncate text-xs text-muted">{c.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {data.similar?.length > 0 && (
          <section className="mt-12">
            <MovieRow title="More Like This" movies={data.similar} />
          </section>
        )}

        {/* Reviews */}
        <section className="mt-14 max-w-4xl">
          <ReviewSection movie={movie} />
        </section>
      </div>

      {trailer && <TrailerModal videoId={movie.trailer} title={movie.title} onClose={() => setTrailer(false)} />}
    </div>
  );
}

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <dt className="text-muted">{label}:</dt>
      <dd className="font-medium text-white">{value}</dd>
    </div>
  );
}
