import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { movieApi, reviewApi } from '../services/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import RatingStars from './RatingStars.jsx';
import { Trash, Edit, Flag } from './Icons.jsx';
import { timeAgo } from '../utils/format.js';

export default function ReviewSection({ movie }) {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const slug = movie.slug;

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => movieApi.reviews(slug).then((d) => d.items),
  });

  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);

  const myReview = reviews.find((r) => r.user?._id === user?._id);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['reviews', slug] });
    qc.invalidateQueries({ queryKey: ['movie', slug] });
  };

  const create = useMutation({
    mutationFn: () => movieApi.addReview(slug, { rating, text }),
    onSuccess: () => {
      toast.success('Review posted');
      setRating(0);
      setText('');
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: () => reviewApi.update(editingId, { rating, text }),
    onSuccess: () => {
      toast.success('Review updated');
      setEditingId(null);
      setRating(0);
      setText('');
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => reviewApi.remove(id),
    onSuccess: () => {
      toast.success('Review deleted');
      invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const report = useMutation({
    mutationFn: (id) => reviewApi.report(id, 'Reported by user'),
    onSuccess: () => toast.success('Reported for moderation'),
    onError: (e) => toast.error(e.message),
  });

  const startEdit = (r) => {
    setEditingId(r._id);
    setRating(r.rating);
    setText(r.text);
    window.scrollTo({ top: window.scrollY - 200, behavior: 'smooth' });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please pick a star rating');
    editingId ? update.mutate() : create.mutate();
  };

  const canWrite = isAuthenticated && (!myReview || editingId);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-title">Reviews ({reviews.length})</h2>
        {movie.userRatingCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <RatingStars value={Math.round(movie.userRatingAvg)} readOnly size={16} />
            <span>{movie.userRatingAvg.toFixed(1)} · {movie.userRatingCount} ratings</span>
          </div>
        )}
      </div>

      {/* Write / edit form */}
      {!isAuthenticated ? (
        <div className="card-surface mb-6 flex flex-col items-center gap-2 p-6 text-center">
          <p className="text-muted">Sign in to rate and review this title.</p>
          <Link to="/login" className="btn-primary">Sign in</Link>
        </div>
      ) : canWrite ? (
        <form onSubmit={submit} className="card-surface mb-6 space-y-3 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted">Your rating:</span>
            <RatingStars value={rating} onChange={setRating} size={24} />
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Share your thoughts (optional)…"
            className="input resize-none"
          />
          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setRating(0);
                  setText('');
                }}
                className="btn-outline"
              >
                Cancel
              </button>
            )}
            <button type="submit" disabled={create.isPending || update.isPending} className="btn-primary">
              {editingId ? 'Update review' : 'Post review'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mb-6 text-sm text-muted">You’ve reviewed this title. You can edit or delete your review below.</p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="skeleton h-24 w-full rounded-xl" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-muted">No reviews yet — be the first!</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => {
            const mine = r.user?._id === user?._id;
            return (
              <div key={r._id} className="card-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold uppercase text-white">
                      {r.user?.name?.[0] || 'U'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{r.user?.name || 'User'}</p>
                      <div className="flex items-center gap-2">
                        <RatingStars value={r.rating} readOnly size={13} />
                        <span className="text-xs text-muted">{timeAgo(r.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-muted">
                    {mine ? (
                      <>
                        <button onClick={() => startEdit(r)} className="rounded p-1.5 transition hover:bg-white/10 hover:text-white" aria-label="Edit">
                          <Edit width={16} height={16} />
                        </button>
                        <button onClick={() => remove.mutate(r._id)} className="rounded p-1.5 transition hover:bg-white/10 hover:text-brand-light" aria-label="Delete">
                          <Trash width={16} height={16} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => report.mutate(r._id)} className="rounded p-1.5 transition hover:bg-white/10 hover:text-white" aria-label="Report">
                        <Flag width={16} height={16} />
                      </button>
                    )}
                  </div>
                </div>
                {r.text && <p className="mt-3 whitespace-pre-line text-sm text-white/80">{r.text}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
