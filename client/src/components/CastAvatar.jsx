import { useState } from 'react';

/** Circular cast avatar — shows the TMDB headshot when available, else initials. */
export default function CastAvatar({ person, size = 'h-24 w-24' }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = person.photo && !failed;

  return (
    <div className={`mx-auto overflow-hidden rounded-full ring-1 ring-white/10 ${size}`}>
      {showPhoto ? (
        <img
          src={person.photo}
          alt={person.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-elevated to-card text-2xl font-bold text-white/70">
          {person.name?.[0] || '?'}
        </div>
      )}
    </div>
  );
}
