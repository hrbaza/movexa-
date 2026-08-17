// Minimal inline icon set (stroke-based, inherit currentColor).
const s = (props) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...props,
});

export const Play = (p) => (
  <svg {...s(p)}><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" /></svg>
);
export const Pause = (p) => (
  <svg {...s(p)}><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none"/></svg>
);
export const Plus = (p) => (<svg {...s(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const Check = (p) => (<svg {...s(p)}><path d="M20 6 9 17l-5-5" /></svg>);
export const Heart = (p) => (
  <svg {...s(p)}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>
);
export const Star = (p) => (
  <svg {...s(p)}><polygon points="12 2 15 9 22 9.3 16.5 14 18.5 21 12 17 5.5 21 7.5 14 2 9.3 9 9 12 2" /></svg>
);
export const Search = (p) => (<svg {...s(p)}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>);
export const Menu = (p) => (<svg {...s(p)}><path d="M3 6h18M3 12h18M3 18h18" /></svg>);
export const X = (p) => (<svg {...s(p)}><path d="M18 6 6 18M6 6l12 12" /></svg>);
export const ChevronLeft = (p) => (<svg {...s(p)}><path d="m15 18-6-6 6-6" /></svg>);
export const ChevronRight = (p) => (<svg {...s(p)}><path d="m9 18 6-6-6-6" /></svg>);
export const ChevronDown = (p) => (<svg {...s(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const Volume = (p) => (<svg {...s(p)}><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14" /></svg>);
export const VolumeMute = (p) => (<svg {...s(p)}><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="m23 9-6 6M17 9l6 6" /></svg>);
export const Fullscreen = (p) => (<svg {...s(p)}><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" /></svg>);
export const Settings = (p) => (<svg {...s(p)}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.6 7a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 7 2.6h.1A1.6 1.6 0 0 0 8.2 1.1V1a2 2 0 1 1 4 0v.1A1.6 1.6 0 0 0 15 2.6a1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1Z" /></svg>);
export const Trash = (p) => (<svg {...s(p)}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /></svg>);
export const Edit = (p) => (<svg {...s(p)}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>);
export const User = (p) => (<svg {...s(p)}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>);
export const Film = (p) => (<svg {...s(p)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4" /></svg>);
export const Grid = (p) => (<svg {...s(p)}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>);
export const Users = (p) => (<svg {...s(p)}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/></svg>);
export const Chart = (p) => (<svg {...s(p)}><path d="M3 3v18h18"/><rect x="7" y="10" width="3" height="7"/><rect x="12" y="6" width="3" height="11"/><rect x="17" y="13" width="3" height="4"/></svg>);
export const Flag = (p) => (<svg {...s(p)}><path d="M4 22V3M4 4h12l-2 4 2 4H4" /></svg>);
export const Clock = (p) => (<svg {...s(p)}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
export const Logo = (p) => (
  <svg viewBox="0 0 64 64" width={p.width || 30} height={p.height || 30} fill="none">
    <path d="M14 46V18l10 14 8-10 8 10 10-14v28" stroke="url(#lg)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff3b4a" /><stop offset="1" stopColor="#b0121d" />
      </linearGradient>
    </defs>
  </svg>
);
