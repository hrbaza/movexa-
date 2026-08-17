import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi, reviewApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import RatingStars from '../../components/RatingStars.jsx';
import PosterImage from '../../components/PosterImage.jsx';
import { Trash } from '../../components/Icons.jsx';
import { PageLoader } from '../../components/Spinner.jsx';
import { timeAgo } from '../../utils/format.js';

export default function AdminReviews() {
  const qc = useQueryClient();
  const toast = useToast();

  const { data, isLoading } = useQuery({ queryKey: ['admin-reviews'], queryFn: adminApi.reportedReviews });

  const remove = useMutation({
    mutationFn: (id) => reviewApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-reviews'] }); toast.success('Review removed'); },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) return <PageLoader />;
  const reviews = data?.items || [];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Reported Reviews</h1>
      <p className="mb-6 text-sm text-muted">{reviews.length} flagged for moderation</p>

      {reviews.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
          <p className="text-muted">🎉 No reported reviews. All clear!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card-surface flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
              {r.movie && (
                <Link to={`/movie/${r.movie.slug}`} className="w-16 shrink-0">
                  <PosterImage movie={r.movie} className="w-full rounded-lg" />
                </Link>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{r.user?.name || 'User'}</p>
                  <RatingStars value={r.rating} readOnly size={13} />
                  <span className="text-xs text-muted">· {timeAgo(r.createdAt)}</span>
                </div>
                <p className="text-xs text-muted">on {r.movie?.title}</p>
                {r.text && <p className="mt-2 text-sm text-white/80">{r.text}</p>}
                {r.reportReason && (
                  <p className="mt-2 inline-block rounded bg-brand/20 px-2 py-0.5 text-xs text-brand-light">
                    ⚑ {r.reportReason}
                  </p>
                )}
              </div>
              <button onClick={() => remove.mutate(r._id)} className="btn-outline self-start text-brand-light">
                <Trash width={16} height={16} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
