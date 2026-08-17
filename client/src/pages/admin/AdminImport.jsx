import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Search, Plus, Check } from '../../components/Icons.jsx';
import Spinner from '../../components/Spinner.jsx';

export default function AdminImport() {
  const qc = useQueryClient();
  const toast = useToast();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [importedIds, setImportedIds] = useState({});

  const { data: status } = useQuery({ queryKey: ['tmdb-status'], queryFn: adminApi.tmdbStatus });

  const { data, isFetching } = useQuery({
    queryKey: ['tmdb-search', query],
    queryFn: () => adminApi.tmdbSearch(query),
    enabled: query.length > 0 && status?.configured,
  });

  const importMovie = useMutation({
    mutationFn: (tmdbId) => adminApi.tmdbImport(tmdbId),
    onSuccess: (res, tmdbId) => {
      setImportedIds((m) => ({ ...m, [tmdbId]: res.movie.slug }));
      qc.invalidateQueries({ queryKey: ['admin-movies'] });
      qc.invalidateQueries({ queryKey: ['home'] });
      toast.success(res.imported ? `Imported “${res.movie.title}”` : 'Already in catalog');
    },
    onError: (e) => toast.error(e.message),
  });

  const submit = (e) => {
    e.preventDefault();
    setQuery(input.trim());
  };

  if (status && !status.configured) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold">Import from TMDB</h1>
        <div className="card-surface mt-6 max-w-xl p-6">
          <p className="text-sm text-white/80">
            TMDB isn’t configured yet. Add a free API key to enable live movie import and
            real-data seeding.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-muted">
            <li>1. Create a key at <span className="text-brand-light">themoviedb.org/settings/api</span></li>
            <li>2. Add <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">TMDB_API_KEY=your_key</code> to <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">server/.env</code></li>
            <li>3. Restart the server (<code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">npm run dev</code>)</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold">Import from TMDB</h1>
        <p className="text-sm text-muted">Search The Movie Database and add titles to your catalog.</p>
      </div>

      <form onSubmit={submit} className="mb-6 max-w-xl">
        <div className="relative">
          <Search width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search TMDB — e.g. Oppenheimer, Dune…"
            className="input pl-10"
          />
        </div>
      </form>

      {isFetching && <Spinner />}

      {data?.items?.length === 0 && query && !isFetching && (
        <p className="text-muted">No results for “{query}”.</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {data?.items?.map((m) => {
          const done = m.imported || importedIds[m.tmdbId];
          const slug = importedIds[m.tmdbId] || m.slug;
          return (
            <div key={m.tmdbId} className="card-surface overflow-hidden">
              <div className="aspect-[2/3] w-full bg-elevated">
                {m.poster ? (
                  <img src={m.poster} alt={m.title} className="h-full w-full object-cover" loading="lazy" />
                ) : (
                  <div className="grid h-full place-items-center text-xs text-muted">No poster</div>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-semibold">{m.title}</p>
                <p className="text-xs text-muted">{m.year || '—'} · ⭐ {m.rating?.toFixed(1) || '—'}</p>
                {done ? (
                  <Link to={slug ? `/movie/${slug}` : '#'} className="btn-outline mt-2 w-full justify-center py-1.5 text-xs text-emerald-300">
                    <Check width={14} height={14} /> In catalog
                  </Link>
                ) : (
                  <button
                    onClick={() => importMovie.mutate(m.tmdbId)}
                    disabled={importMovie.isPending}
                    className="btn-primary mt-2 w-full justify-center py-1.5 text-xs"
                  >
                    <Plus width={14} height={14} /> Import
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
