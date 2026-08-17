import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useLibrary.js';
import MovieGrid from '../components/MovieGrid.jsx';

export default function Favorites() {
  const { data, isLoading } = useFavorites();

  return (
    <div className="container-page min-h-[60vh] pt-24">
      <h1 className="font-display text-3xl font-extrabold">Favorites</h1>
      <p className="mt-1 text-sm text-muted">{data?.length ?? 0} titles you love</p>

      <div className="mt-8">
        {!isLoading && data?.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <div>
              <p className="text-lg font-semibold">No favorites yet</p>
              <p className="mt-1 text-sm text-muted">Tap the ♥ on any movie to add it here.</p>
              <Link to="/movies" className="btn-primary mt-4">Browse movies</Link>
            </div>
          </div>
        ) : (
          <MovieGrid movies={data || []} loading={isLoading} />
        )}
      </div>
    </div>
  );
}
