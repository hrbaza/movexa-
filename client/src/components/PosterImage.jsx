import { useState } from 'react';
import { generatePoster, generateBackdrop } from '../utils/poster.js';

/**
 * Renders a movie poster/backdrop. Uses the real image URL when present and
 * falls back to a generated SVG (also the initial src when no URL exists), so
 * there's never a broken image.
 */
export default function PosterImage({ movie, variant = 'poster', className = '', ...rest }) {
  const generated = variant === 'backdrop' ? generateBackdrop(movie) : generatePoster(movie);
  const initial = (variant === 'backdrop' ? movie?.backdrop : movie?.poster) || generated;
  const [src, setSrc] = useState(initial);

  return (
    <img
      src={src}
      alt={movie?.title || ''}
      loading="lazy"
      onError={() => src !== generated && setSrc(generated)}
      className={className}
      {...rest}
    />
  );
}
