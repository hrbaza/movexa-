import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useHistory } from '../hooks/useLibrary.js';
import { libraryApi } from '../services/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';
import PosterImage from '../components/PosterImage.jsx';
import { Play, Trash } from '../components/Icons.jsx';
import { timeAgo } from '../utils/format.js';

export default function History() {
  const { data, isLoading } = useHistory();
  const qc = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const remove = async (id) => {
    try {
      await libraryApi.removeHistory(id);
      qc.invalidateQueries({ queryKey: ['history'] });
      qc.invalidateQueries({ queryKey: ['continue'] });
      toast.success('Removed from history');
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="container-page min-h-[60vh] pt-24">
      <h1 className="font-display text-3xl font-extrabold">Watch History</h1>
      <p className="mt-1 text-sm text-muted">{data?.length ?? 0} titles watched</p>

      <div className="mt-8 space-y-3">
        {isLoading &&
          [1, 2, 3].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}

        {!isLoading && data?.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <div>
              <p className="text-lg font-semibold">Nothing watched yet</p>
              <p className="mt-1 text-sm text-muted">Movies you play will show up here.</p>
              <Link to="/movies" className="btn-primary mt-4">Browse movies</Link>
            </div>
          </div>
        )}

        {data?.map((h) => (
          <div key={h._id} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-card p-3">
            <Link to={`/movie/${h.movie.slug}`} className="relative w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
              <PosterImage movie={h.movie} variant="backdrop" className="aspect-video w-full object-cover" />
              {h.completion > 0 && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
                  <div className="h-full bg-brand" style={{ width: `${h.completion}%` }} />
                </div>
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <Link to={`/movie/${h.movie.slug}`} className="truncate font-semibold hover:text-brand-light">
                {h.movie.title}
              </Link>
              <p className="text-xs text-muted">
                {h.completion >= 95 ? 'Finished' : `${h.completion}% watched`} · {timeAgo(h.lastWatchedAt)}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted">{h.movie.genres?.join(' · ')}</p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate(`/watch/${h.movie.slug}`)}
                className="rounded-full bg-brand p-2.5 text-white transition hover:bg-brand-light"
                aria-label="Resume"
              >
                <Play width={16} height={16} />
              </button>
              <button
                onClick={() => remove(h._id)}
                className="rounded-full p-2.5 text-muted transition hover:bg-white/10 hover:text-brand-light"
                aria-label="Remove"
              >
                <Trash width={16} height={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
