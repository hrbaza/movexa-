import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo, Search, Menu, X, User, ChevronDown } from './Icons.jsx';

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/movies', label: 'Movies' },
  { to: '/genres', label: 'Genres' },
];

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-night/90 shadow-lg backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo width={30} height={30} />
          <span className="font-display text-xl font-extrabold tracking-tight">
            MOVE<span className="text-brand">XA</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'text-white' : 'text-muted hover:text-white'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 sm:block">
          <div className="relative">
            <Search width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies, actors…"
              className="input pl-10"
            />
          </div>
        </form>

        {isAuthenticated ? (
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2 transition hover:border-white/30"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold uppercase text-white">
                {user?.name?.[0] || 'U'}
              </span>
              <ChevronDown width={16} height={16} className="text-muted" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 animate-fade-in overflow-hidden rounded-xl border border-white/10 bg-elevated shadow-card">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted">{user.email}</p>
                </div>
                <div className="py-1">
                  <MenuLink to="/profile">Profile</MenuLink>
                  <MenuLink to="/watchlist">My Watchlist</MenuLink>
                  <MenuLink to="/favorites">Favorites</MenuLink>
                  <MenuLink to="/history">Watch History</MenuLink>
                  {isAdmin && <MenuLink to="/admin">Admin Dashboard</MenuLink>}
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full border-t border-white/10 px-4 py-2.5 text-left text-sm text-brand-light transition hover:bg-white/5"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="ml-2 hidden items-center gap-2 sm:flex">
            <Link to="/login" className="btn-outline">Sign in</Link>
            <Link to="/register" className="btn-primary">Sign up</Link>
          </div>
        )}

        <button className="ml-1 rounded-lg p-2 text-white md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/10 bg-night/95 backdrop-blur md:hidden">
          <div className="container-page space-y-1 py-4">
            <form onSubmit={submitSearch} className="mb-3">
              <div className="relative">
                <Search width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="input pl-10" />
              </div>
            </form>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-white/5 hover:text-white">
                {n.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-outline flex-1">Sign in</Link>
                <Link to="/register" className="btn-primary flex-1">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuLink({ to, children }) {
  return (
    <Link to={to} className="block px-4 py-2.5 text-sm text-white/90 transition hover:bg-white/5 hover:text-white">
      {children}
    </Link>
  );
}
