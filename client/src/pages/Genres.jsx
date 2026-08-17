import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { genreApi } from '../services/endpoints.js';
import { PageLoader } from '../components/Spinner.jsx';

const GRADS = [
  'from-red-600/30 to-orange-500/10',
  'from-blue-600/30 to-cyan-500/10',
  'from-purple-600/30 to-pink-500/10',
  'from-emerald-600/30 to-teal-500/10',
  'from-amber-600/30 to-yellow-500/10',
  'from-fuchsia-600/30 to-rose-500/10',
];

export default function Genres() {
  const { data, isLoading } = useQuery({ queryKey: ['genres'], queryFn: genreApi.list });

  if (isLoading) return <PageLoader />;

  return (
    <div className="container-page pt-24">
      <h1 className="font-display text-3xl font-extrabold">Genres</h1>
      <p className="mt-1 text-sm text-muted">Explore movies by category</p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data?.items?.map((g, i) => (
          <Link
            key={g._id}
            to={`/genre/${g.slug}`}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${GRADS[i % GRADS.length]} p-6 transition hover:scale-[1.02] hover:border-white/30`}
          >
            <h2 className="font-display text-xl font-bold text-white">{g.name}</h2>
            <p className="mt-1 text-sm text-muted">{g.count} titles</p>
            {g.description && <p className="mt-3 line-clamp-2 text-xs text-white/60">{g.description}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
