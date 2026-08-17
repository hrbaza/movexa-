import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { movieApi, genreApi } from '../services/endpoints.js';
import MovieGrid from '../components/MovieGrid.jsx';
import { ChevronDown } from '../components/Icons.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const SORTS = [
  ['popularity', 'Most Popular'],
  ['rating', 'Top Rated'],
  ['newest', 'Newest'],
  ['oldest', 'Oldest'],
  ['alphabetical', 'A–Z'],
];
const QUALITIES = ['SD', 'HD', 'FHD', '4K'];
const YEARS = ['', '2020', '2015', '2010', '2000', '1990'];

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);

  const genre = params.get('genre') || '';
  const sort = params.get('sort') || 'popularity';
  const quality = params.get('quality') || '';
  const yearFrom = params.get('yearFrom') || '';
  const minRating = params.get('minRating') || '';
  const trending = params.get('trending') || '';

  useDocumentTitle(trending ? 'Trending Movies' : genre ? `${genre} Movies` : 'Movies');
  useEffect(() => setPage(1), [genre, sort, quality, yearFrom, minRating, trending]);

  const { data: genreData } = useQuery({ queryKey: ['genres'], queryFn: genreApi.list });

  const query = { genre, sort, quality, yearFrom, minRating, trending, page, limit: 24 };
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['movies', query],
    queryFn: () => movieApi.list(query),
    placeholderData: keepPreviousData,
  });

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const movies = data?.items || [];

  return (
    <div className="container-page pt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold">
            {trending ? 'Trending' : 'All Movies'}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {data ? `${data.total} titles` : 'Browse the catalog'}
          </p>
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="input appearance-none pr-9"
          >
            {SORTS.map(([v, l]) => (
              <option key={v} value={v} className="bg-elevated">{l}</option>
            ))}
          </select>
          <ChevronDown width={16} height={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 rounded-xl border border-white/10 bg-card/50 p-4">
        <FilterGroup label="Genre">
          <Chip active={!genre} onClick={() => setParam('genre', '')}>All</Chip>
          {genreData?.items?.map((g) => (
            <Chip key={g._id} active={genre === g.name} onClick={() => setParam('genre', g.name)}>
              {g.name}
            </Chip>
          ))}
        </FilterGroup>

        <div className="grid gap-4 sm:grid-cols-3">
          <FilterGroup label="Quality">
            <Chip active={!quality} onClick={() => setParam('quality', '')}>Any</Chip>
            {QUALITIES.map((q) => (
              <Chip key={q} active={quality === q} onClick={() => setParam('quality', q)}>{q}</Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="From year">
            {YEARS.map((y) => (
              <Chip key={y || 'any'} active={yearFrom === y} onClick={() => setParam('yearFrom', y)}>
                {y || 'Any'}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Min rating">
            <Chip active={!minRating} onClick={() => setParam('minRating', '')}>Any</Chip>
            {['7', '8', '9'].map((r) => (
              <Chip key={r} active={minRating === r} onClick={() => setParam('minRating', r)}>{r}+</Chip>
            ))}
          </FilterGroup>
        </div>
      </div>

      <MovieGrid movies={movies} loading={isLoading} />

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => p - 1)}
            className="btn-outline"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-muted">
            Page {page} of {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
            className="btn-outline"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`chip ${active ? 'chip-active' : ''}`}>
      {children}
    </button>
  );
}
