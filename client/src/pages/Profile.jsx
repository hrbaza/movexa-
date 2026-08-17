import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useWatchlist, useFavorites, useHistory } from '../hooks/useLibrary.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const { data: watchlist } = useWatchlist();
  const { data: favorites } = useFavorites();
  const { data: history } = useHistory();

  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [prefs, setPrefs] = useState(user.preferences?.notifications || {});
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { name, preferences: { notifications: prefs } };
      if (password) body.password = password;
      await updateProfile(body);
      setPassword('');
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: 'Watchlist', value: watchlist?.length ?? 0, to: '/watchlist' },
    { label: 'Favorites', value: favorites?.length ?? 0, to: '/favorites' },
    { label: 'Watched', value: history?.length ?? 0, to: '/history' },
  ];

  return (
    <div className="container-page max-w-5xl pt-24">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-brand/10 to-transparent p-6 sm:flex-row sm:items-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-brand text-3xl font-bold uppercase text-white shadow-glow">
          {user.name[0]}
        </span>
        <div className="text-center sm:text-left">
          <h1 className="font-display text-2xl font-extrabold">{user.name}</h1>
          <p className="text-muted">{user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted">
            {user.role.replace('_', ' ')} · {user.subscription?.plan} plan
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="card-surface p-4 text-center transition hover:border-white/20">
            <p className="font-display text-2xl font-extrabold text-brand-light">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Edit form */}
      <form onSubmit={save} className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Account details</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input value={user.email} disabled className="input cursor-not-allowed opacity-60" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">New password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="Leave blank to keep current" />
            </div>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Notifications</h2>
          <div className="space-y-1">
            <Toggle label="New releases" checked={prefs.newReleases !== false} onChange={(v) => setPrefs({ ...prefs, newReleases: v })} />
            <Toggle label="Watchlist updates" checked={prefs.watchlist !== false} onChange={(v) => setPrefs({ ...prefs, watchlist: v })} />
            <Toggle label="Security alerts" checked={prefs.security !== false} onChange={(v) => setPrefs({ ...prefs, security: v })} />
          </div>
        </div>

        <div className="md:col-span-2">
          <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-2.5 transition hover:bg-white/5">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-brand' : 'bg-white/20'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </label>
  );
}
