import { Link } from 'react-router-dom';
import { useWatchlist } from '../hooks/useLibrary.js';
import MovieGrid from '../components/MovieGrid.jsx';

export default function Watchlist() {
  const { data, isLoading } = useWatchlist();

  return (
    <div className="container-page min-h-[60vh] pt-24">
      <h1 className="font-display text-3xl font-extrabold">My Watchlist</h1>
      <p className="mt-1 text-sm text-muted">{data?.length ?? 0} titles saved to watch later</p>

      <div className="mt-8">
        {!isLoading && data?.length === 0 ? (
          <Empty />
        ) : (
          <MovieGrid movies={data || []} loading={isLoading} />
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
      <div>
        <p className="text-lg font-semibold">Your watchlist is empty</p>
        <p className="mt-1 text-sm text-muted">Add movies you want to watch later.</p>
        <Link to="/movies" className="btn-primary mt-4">Browse movies</Link>
      </div>
    </div>
  );
}
