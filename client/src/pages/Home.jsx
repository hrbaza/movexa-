import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { movieApi } from '../services/endpoints.js';
import { useContinueWatching } from '../hooks/useLibrary.js';
import Hero from '../components/Hero.jsx';
import MovieRow from '../components/MovieRow.jsx';
import { PageLoader } from '../components/Spinner.jsx';

export default function Home() {
  const { data, isLoading } = useQuery({ queryKey: ['home'], queryFn: movieApi.home });
  const { data: continueItems } = useContinueWatching();

  if (isLoading) return <PageLoader />;
  const home = data || {};

  const continueMovies =
    continueItems?.map((c) => ({ ...c.movie, _progress: c.completion })) || [];

  return (
    <div>
      <Hero movies={home.featured?.length ? home.featured : home.trending || []} />

      <div className="container-page relative z-10 -mt-8 space-y-10 pb-10 sm:-mt-12">
        {continueMovies.length > 0 && (
          <MovieRow title="Continue Watching" movies={continueMovies} />
        )}

        <MovieRow title="🔥 Trending Now" movies={home.trending} viewAllTo="/movies?trending=true" />
        <MovieRow title="Popular Movies" movies={home.popular} viewAllTo="/movies?sort=popularity" />
        <MovieRow title="Latest Releases" movies={home.latest} viewAllTo="/movies?sort=newest" />
        <MovieRow title="Top Rated" movies={home.topRated} viewAllTo="/movies?sort=rating" />

        {/* Genre chips */}
        {home.genres?.length > 0 && (
          <section>
            <h2 className="section-title mb-4">Browse by Genre</h2>
            <div className="flex flex-wrap gap-3">
              {home.genres.map((g) => (
                <Link
                  key={g.name}
                  to={`/genre/${g.name.toLowerCase()}`}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-card px-6 py-5 transition hover:border-brand/50 hover:bg-elevated"
                >
                  <span className="relative z-10 font-display text-lg font-bold">{g.name}</span>
                  <span className="relative z-10 ml-2 text-sm text-muted">{g.count}</span>
                  <div className="absolute inset-0 -z-0 bg-gradient-to-br from-brand/0 to-brand/0 opacity-0 transition group-hover:from-brand/10 group-hover:to-transparent group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
