import { useState } from 'react';
import { Star } from './Icons.jsx';

/** Read-only or interactive 5-star rating. */
export default function RatingStars({ value = 0, onChange, size = 20, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange?.(n)}
          className={`transition ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${
            n <= display ? 'text-brand-amber' : 'text-white/20'
          }`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star width={size} height={size} />
        </button>
      ))}
    </div>
  );
}
