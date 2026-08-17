import MovieCard from './MovieCard.jsx';

export default function MovieGrid({ movies = [], loading = false, skeletonCount = 12 }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl">
            <div className="skeleton aspect-[2/3] w-full" />
            <div className="space-y-2 p-2.5">
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-2.5 w-1/2 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="grid place-items-center rounded-xl border border-dashed border-white/10 py-20 text-center">
        <p className="text-muted">No titles found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((m) => (
        <MovieCard key={m._id} movie={m} />
      ))}
    </div>
  );
}
