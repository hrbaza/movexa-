import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../services/endpoints.js';
import MovieGrid from '../components/MovieGrid.jsx';
import { Search as SearchIcon } from '../components/Icons.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const [input, setInput] = useState(q);
  useDocumentTitle(q ? `Search: ${q}` : 'Search');

  useEffect(() => setInput(q), [q]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchApi.query(q),
    enabled: q.length > 0,
  });

  const submit = (e) => {
    e.preventDefault();
    if (input.trim()) setParams({ q: input.trim() });
  };

  return (
    <div className="container-page min-h-[70vh] pt-24">
      <form onSubmit={submit} className="mx-auto max-w-2xl">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search movies, actors, directors, genres…"
            className="input py-3.5 pl-12 text-base"
          />
        </div>
      </form>

      {!q && (
        <p className="mt-10 text-center text-muted">Start typing to search the catalog.</p>
      )}

      {q && (
        <div className="mt-8">
          <p className="mb-6 text-sm text-muted">
            {isFetching ? 'Searching…' : `Results for “${q}”`}
          </p>

          {/* People */}
          {data?.people?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">People</h3>
              <div className="flex flex-wrap gap-3">
                {data.people.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 rounded-full border border-white/10 bg-card px-3 py-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold uppercase text-white">
                      {p.name[0]}
                    </span>
                    <div className="pr-1">
                      <p className="text-sm font-semibold leading-tight">{p.name}</p>
                      <p className="text-xs text-muted">{p.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Genres */}
          {data?.genres?.length > 0 && (
            <div className="mb-8">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {data.genres.map((g) => (
                  <Link key={g._id} to={`/genre/${g.slug}`} className="chip">{g.name}</Link>
                ))}
              </div>
            </div>
          )}

          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Movies {data?.movies ? `(${data.movies.length})` : ''}
          </h3>
          <MovieGrid movies={data?.movies || []} loading={isLoading} skeletonCount={6} />
        </div>
      )}
    </div>
  );
}
