import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { movieApi, libraryApi } from '../services/endpoints.js';
import { useLibraryStatus } from '../hooks/useLibrary.js';
import VideoPlayer from '../components/VideoPlayer.jsx';
import { generateBackdrop } from '../utils/poster.js';
import { PageLoader } from '../components/Spinner.jsx';
import { Link } from 'react-router-dom';

export default function Watch() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['movie', slug],
    queryFn: () => movieApi.get(slug),
  });
  const movie = data?.movie;
  const { data: status } = useLibraryStatus(movie?._id);

  const saveProgress = useMutation({
    mutationFn: (body) => libraryApi.saveProgress({ movieId: movie._id, ...body }),
  });

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-black"><PageLoader /></div>;

  if (!movie)
    return (
      <div className="grid min-h-screen place-items-center bg-black text-center">
        <div>
          <p className="text-muted">This title isn’t available.</p>
          <Link to="/movies" className="btn-primary mt-4">Browse movies</Link>
        </div>
      </div>
    );

  const startAt = status?.progress?.position || 0;

  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-[1600px]">
        <VideoPlayer
          src={movie.videoUrl}
          poster={movie.backdrop || generateBackdrop(movie)}
          title={movie.title}
          startAt={startAt}
          onBack={() => navigate(`/movie/${movie.slug}`)}
          onProgress={(p) => saveProgress.mutate(p)}
          onEnded={() =>
            saveProgress.mutate({ position: movie.runtime * 60 || 0, duration: movie.runtime * 60 || 0 })
          }
        />
      </div>

      {/* Below-player details */}
      <div className="container-page py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{movie.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>{movie.year}</span>
              <span>{movie.quality}</span>
              <span>{movie.genres?.join(' · ')}</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/80">{movie.description}</p>
          </div>
          <Link to={`/movie/${movie.slug}`} className="btn-outline">← Details</Link>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-card/50 p-4 text-xs text-muted">
          🎬 Demo playback uses a Creative-Commons sample clip. In production, Movexa streams
          licensed content via HLS/DASH with signed, tokenized URLs (see SRS §FR-36).
        </div>
      </div>
    </div>
  );
}
