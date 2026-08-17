// Generates brand-consistent SVG poster / backdrop art from movie data.
// Used as the image source (and as an <img> onError fallback) so the UI stays
// crisp and cinematic even fully offline, with no broken images.

const PALETTES = [
  ['#E11D2A', '#7a0a12'],
  ['#F5A623', '#7a4d05'],
  ['#3B82F6', '#0b2a63'],
  ['#8B5CF6', '#2e1065'],
  ['#10B981', '#064034'],
  ['#EC4899', '#6b0a3c'],
  ['#06B6D4', '#083b45'],
  ['#F97316', '#6b2c05'],
];

function hash(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrap(text, max) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > max) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines.slice(0, 4);
}

function toDataUri(svg) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Poster (2:3). */
export function generatePoster(movie = {}) {
  const title = movie.title || 'Untitled';
  const [c1, c2] = PALETTES[hash(title) % PALETTES.length];
  const lines = wrap(title, 14);
  const startY = 300 - (lines.length - 1) * 26;
  const textEls = lines
    .map(
      (l, i) =>
        `<text x="40" y="${startY + i * 52}" font-family="Poppins,Inter,sans-serif" font-size="44" font-weight="800" fill="#ffffff">${esc(l)}</text>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.35" stop-color="#000000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="#101010"/>
    <rect width="400" height="600" fill="url(#bg)" opacity="0.9"/>
    <circle cx="330" cy="90" r="140" fill="#ffffff" opacity="0.08"/>
    <circle cx="70" cy="470" r="120" fill="#000000" opacity="0.18"/>
    <rect width="400" height="600" fill="url(#shade)"/>
    <text x="40" y="70" font-family="Poppins,sans-serif" font-size="18" font-weight="700" fill="#ffffff" opacity="0.7" letter-spacing="3">MOVEXA</text>
    ${textEls}
    <text x="40" y="${startY + lines.length * 52 + 20}" font-family="Inter,sans-serif" font-size="22" font-weight="600" fill="#ffffff" opacity="0.75">${esc(movie.year || '')} · ${esc((movie.genres && movie.genres[0]) || 'Film')}</text>
  </svg>`;
  return toDataUri(svg);
}

/** Backdrop (16:9), for hero + detail headers. */
export function generateBackdrop(movie = {}) {
  const title = movie.title || 'Untitled';
  const [c1, c2] = PALETTES[hash(title) % PALETTES.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${c2}"/><stop offset="1" stop-color="#0a0a0a"/>
      </linearGradient>
      <radialGradient id="spot" cx="0.75" cy="0.25" r="0.7">
        <stop offset="0" stop-color="${c1}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${c1}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#bg)"/>
    <rect width="1280" height="720" fill="url(#spot)"/>
    <g opacity="0.10" fill="none" stroke="#ffffff" stroke-width="2">
      <circle cx="980" cy="180" r="220"/><circle cx="980" cy="180" r="150"/><circle cx="980" cy="180" r="90"/>
    </g>
    <text x="80" y="640" font-family="Poppins,sans-serif" font-size="120" font-weight="800" fill="#ffffff" opacity="0.06">${esc(title.slice(0, 16))}</text>
  </svg>`;
  return toDataUri(svg);
}
