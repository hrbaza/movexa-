import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Logo, Grid, Film, Users, Flag, Menu, X, Search } from '../components/Icons.jsx';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: Grid, end: true },
  { to: '/admin/movies', label: 'Movies', icon: Film },
  { to: '/admin/import', label: 'Import from TMDB', icon: Search },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reviews', label: 'Reported Reviews', icon: Flag },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const Sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2 px-5 py-5">
        <Logo width={28} height={28} />
        <span className="font-display text-lg font-extrabold">
          MOVE<span className="text-brand">XA</span>
        </span>
        <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted">Admin</span>
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand/20 text-white ring-1 ring-brand/40' : 'text-muted hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon width={18} height={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link to="/" className="mb-1 block rounded-lg px-3 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-white">
          ← Back to site
        </Link>
        <div className="flex items-center gap-2 px-3 py-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold uppercase text-white">
            {user?.name?.[0]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user?.name}</p>
            <p className="truncate text-[11px] text-muted">{user?.role}</p>
          </div>
          <button onClick={() => { logout(); navigate('/admin/login'); }} className="text-xs text-brand-light hover:underline">
            Exit
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-night">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-surface lg:block">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-white/10 bg-surface">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-surface/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-white" aria-label="Menu">
            <Menu />
          </button>
          <span className="font-display font-bold">Movexa Admin</span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
