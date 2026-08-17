import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { genreApi } from '../services/endpoints.js';
import MovieGrid from '../components/MovieGrid.jsx';
import { PageLoader } from '../components/Spinner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

export default function GenrePage() {
  const { slug } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['genre', slug],
    queryFn: () => genreApi.get(slug),
  });
  useDocumentTitle(data?.genre ? `${data.genre.name} Movies` : 'Genre');

  if (isLoading) return <PageLoader />;
  if (isError)
    return (
      <div className="container-page grid min-h-[60vh] place-items-center pt-24 text-center">
        <div>
          <p className="text-muted">Genre not found.</p>
          <Link to="/genres" className="btn-primary mt-4">All genres</Link>
        </div>
      </div>
    );

  return (
    <div className="container-page pt-24">
      <nav className="mb-4 text-sm text-muted">
        <Link to="/genres" className="hover:text-white">Genres</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{data.genre.name}</span>
      </nav>

      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">{data.genre.name}</h1>
      {data.genre.description && <p className="mt-2 max-w-2xl text-muted">{data.genre.description}</p>}
      <p className="mt-1 text-sm text-muted">{data.movies.length} titles</p>

      <div className="mt-8">
        <MovieGrid movies={data.movies} />
      </div>
    </div>
  );
}
