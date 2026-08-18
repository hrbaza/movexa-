import { useRef } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard.jsx';
import { ChevronLeft, ChevronRight } from './Icons.jsx';

export default function MovieRow({ title, movies = [], viewAllTo, loading = false }) {
  const scroller = useRef(null);

  const scroll = (dir) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' });
  };

  if (!loading && !movies.length) return null;

  return (
    <section className="group/row relative">
      <div className="mb-3 flex items-end justify-between">
        <h2 className="section-title">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAllTo && (
            <Link to={viewAllTo} className="text-sm font-medium text-muted transition hover:text-white">
              View all →
            </Link>
          )}
          <div className="hidden gap-1 sm:flex">
            <button onClick={() => scroll(-1)} className="rounded-full bg-white/10 p-1.5 text-white transition hover:bg-white/20" aria-label="Scroll left">
              <ChevronLeft width={18} height={18} />
            </button>
            <button onClick={() => scroll(1)} className="rounded-full bg-white/10 p-1.5 text-white transition hover:bg-white/20" aria-label="Scroll right">
              <ChevronRight width={18} height={18} />
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto scroll-smooth px-1 pb-2">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-[150px] shrink-0 snap-start sm:w-[170px]">
                <div className="skeleton aspect-[2/3] w-full rounded-xl" />
              </div>
            ))
          : movies.map((m) => (
              <div key={m._id} className="w-[150px] shrink-0 snap-start sm:w-[170px]">
                <MovieCard movie={m} progress={m._progress} />
              </div>
            ))}
      </div>
    </section>
  );
}
