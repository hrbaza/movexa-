import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { Logo } from '../../components/Icons.jsx';

const ADMIN_ROLES = ['admin', 'super_admin', 'content_manager'];

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle('Admin Sign in');

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      if (ADMIN_ROLES.includes(user.role)) {
        navigate('/admin', { replace: true });
      } else {
        logout();
        setError('This account does not have admin access.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center bg-night px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_50%_-10%,rgba(225,29,42,0.15),transparent_60%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <Logo width={34} height={34} />
            <span className="font-display text-2xl font-extrabold">
              MOVE<span className="text-brand">XA</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <span className="h-px w-6 bg-white/20" /> Admin Panel <span className="h-px w-6 bg-white/20" />
          </div>
        </div>

        <div className="card-surface p-6 shadow-card sm:p-8">
          <h1 className="font-display text-xl font-bold">Administrator sign in</h1>
          <p className="mt-1 text-sm text-muted">Restricted area — authorized staff only.</p>

          {error && (
            <div className="mt-4 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand-light">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="admin@movexa.app"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-muted">
          Not an admin?{' '}
          <a href="/" className="text-brand-light hover:underline">Go to Movexa</a>
        </p>
      </div>
    </div>
  );
}
