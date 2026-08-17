import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/endpoints.js';
import { Users, Film, Star, Chart } from '../../components/Icons.jsx';
import { formatViews } from '../../utils/format.js';
import { PageLoader } from '../../components/Spinner.jsx';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-dashboard'], queryFn: adminApi.dashboard });
  const { data: analytics } = useQuery({ queryKey: ['admin-analytics'], queryFn: adminApi.analytics });

  if (isLoading) return <PageLoader />;
  const { stats, recentUsers, topMovies } = data;

  const cards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-400' },
    { label: 'Movies', value: `${stats.published}/${stats.movies}`, sub: 'published', icon: Film, color: 'text-brand-light' },
    { label: 'Total Views', value: formatViews(stats.totalViews), icon: Chart, color: 'text-emerald-400' },
    { label: 'Reviews', value: stats.reviews, icon: Star, color: 'text-brand-amber' },
  ];

  const maxViews = Math.max(1, ...(analytics?.genrePopularity?.map((g) => g.views) || [1]));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
          <p className="text-sm text-muted">Overview of your platform</p>
        </div>
        <Link to="/admin/movies/new" className="btn-primary">+ Add Movie</Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{c.label}</span>
              <c.icon width={20} height={20} className={c.color} />
            </div>
            <p className="mt-2 font-display text-3xl font-extrabold">
              {c.value} {c.sub && <span className="text-sm font-normal text-muted">{c.sub}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Genre popularity */}
        <div className="card-surface p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Views by Genre</h2>
          <div className="space-y-3">
            {analytics?.genrePopularity?.map((g) => (
              <div key={g.genre}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium">{g.genre}</span>
                  <span className="text-muted">{formatViews(g.views)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-amber" style={{ width: `${(g.views / maxViews) * 100}%` }} />
                </div>
              </div>
            )) || <p className="text-sm text-muted">No data</p>}
          </div>
        </div>

        {/* Top movies */}
        <div className="card-surface p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Most Watched</h2>
          <div className="space-y-2">
            {topMovies.map((m, i) => (
              <div key={m._id} className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition hover:bg-white/5">
                <span className="w-5 text-center font-display text-lg font-bold text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted">{m.year} · ⭐ {m.rating?.toFixed(1)}</p>
                </div>
                <span className="text-sm text-muted">{formatViews(m.views)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card-surface mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Recent Signups</h2>
          <Link to="/admin/users" className="text-sm text-muted hover:text-white">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted">
              <tr className="border-b border-white/10">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u._id} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 font-medium">{u.name}</td>
                  <td className="py-2.5 pr-4 text-muted">{u.email}</td>
                  <td className="py-2.5 pr-4">
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{u.role}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
