import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminApi, movieApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import PosterImage from '../../components/PosterImage.jsx';
import { Edit, Trash, Search } from '../../components/Icons.jsx';

export default function AdminMovies() {
  const qc = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies', search, page],
    queryFn: () => adminApi.movies({ search, page, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-movies'] });

  const togglePublish = useMutation({
    mutationFn: ({ id, published }) => movieApi.update(id, { published: !published }),
    onSuccess: () => { invalidate(); toast.success('Updated'); },
    onError: (e) => toast.error(e.message),
  });

  const toggleFeature = useMutation({
    mutationFn: ({ id, featured }) => movieApi.update(id, { featured: !featured }),
    onSuccess: () => { invalidate(); toast.success('Updated'); },
    onError: (e) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id) => movieApi.remove(id),
    onSuccess: () => { invalidate(); setConfirm(null); toast.success('Movie deleted'); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Movies</h1>
          <p className="text-sm text-muted">{data?.total ?? 0} titles</p>
        </div>
        <Link to="/admin/movies/new" className="btn-primary">+ Add Movie</Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search titles…"
          className="input pl-10"
        />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Year</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Views</th>
                <th className="p-3">Status</th>
                <th className="p-3">Featured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td colSpan={7} className="p-3"><div className="skeleton h-10 w-full rounded" /></td>
                  </tr>
                ))}
              {data?.items?.map((m) => (
                <tr key={m._id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <PosterImage movie={m} className="h-14 w-10 shrink-0 rounded object-cover" />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{m.title}</p>
                        <p className="truncate text-xs text-muted">{m.genres?.slice(0, 2).join(', ')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-muted">{m.year}</td>
                  <td className="p-3">⭐ {m.rating?.toFixed(1)}</td>
                  <td className="p-3 text-muted">{m.views}</td>
                  <td className="p-3">
                    <button
                      onClick={() => togglePublish.mutate({ id: m._id, published: m.published })}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${m.published ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-muted'}`}
                    >
                      {m.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => toggleFeature.mutate({ id: m._id, featured: m.featured })}
                      className={`text-lg ${m.featured ? 'text-brand-amber' : 'text-white/20'}`}
                      aria-label="Toggle featured"
                    >
                      ★
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/movies/${m._id}/edit`} className="rounded p-2 text-muted transition hover:bg-white/10 hover:text-white" aria-label="Edit">
                        <Edit width={16} height={16} />
                      </Link>
                      <button onClick={() => setConfirm(m)} className="rounded p-2 text-muted transition hover:bg-white/10 hover:text-brand-light" aria-label="Delete">
                        <Trash width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline">Prev</button>
          <span className="px-3 text-sm text-muted">Page {page} / {data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline">Next</button>
        </div>
      )}

      {/* Delete confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setConfirm(null)}>
          <div className="card-surface w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">Delete “{confirm.title}”?</h3>
            <p className="mt-2 text-sm text-muted">This can’t be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-outline">Cancel</button>
              <button onClick={() => remove.mutate(confirm._id)} disabled={remove.isPending} className="btn-primary">
                {remove.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
