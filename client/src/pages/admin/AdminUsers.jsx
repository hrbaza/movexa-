import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminApi } from '../../services/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Search, Trash } from '../../components/Icons.jsx';
import { formatDate } from '../../utils/format.js';

export default function AdminUsers() {
  const qc = useQueryClient();
  const toast = useToast();
  const { user: me } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminApi.users({ search, page, limit: 15 }),
    placeholderData: keepPreviousData,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-users'] });

  const updateUser = useMutation({
    mutationFn: ({ id, body }) => adminApi.updateUser(id, body),
    onSuccess: () => { invalidate(); toast.success('User updated'); },
    onError: (e) => toast.error(e.message),
  });
  const deleteUser = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => { invalidate(); setConfirm(null); toast.success('User deleted'); },
    onError: (e) => toast.error(e.message),
  });

  const roles = data?.roles || ['user', 'moderator', 'content_manager', 'admin', 'super_admin'];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold">Users</h1>
        <p className="text-sm text-muted">{data?.total ?? 0} registered</p>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or email…" className="input pl-10" />
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={5} className="p-3"><div className="skeleton h-8 w-full rounded" /></td></tr>
                ))}
              {data?.items?.map((u) => {
                const isSelf = u._id === me._id;
                return (
                  <tr key={u._id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold uppercase text-white">{u.name?.[0]}</span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{u.name} {isSelf && <span className="text-xs text-muted">(you)</span>}</p>
                          <p className="truncate text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted">{formatDate(u.createdAt)}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => updateUser.mutate({ id: u._id, body: { role: e.target.value } })}
                        className="rounded-lg border border-white/10 bg-elevated px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="p-3">
                      <button
                        disabled={isSelf}
                        onClick={() => updateUser.mutate({ id: u._id, body: { status: u.status === 'active' ? 'suspended' : 'active' } })}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-brand/20 text-brand-light'}`}
                      >
                        {u.status === 'active' ? 'Active' : 'Suspended'}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        disabled={isSelf || u.role === 'super_admin'}
                        onClick={() => setConfirm(u)}
                        className="rounded p-2 text-muted transition hover:bg-white/10 hover:text-brand-light disabled:opacity-30"
                        aria-label="Delete"
                      >
                        <Trash width={16} height={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {data && data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline">Prev</button>
          <span className="px-3 text-sm text-muted">Page {page} / {data.totalPages}</span>
          <button disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline">Next</button>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setConfirm(null)}>
          <div className="card-surface w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold">Delete {confirm.name}?</h3>
            <p className="mt-2 text-sm text-muted">This permanently removes the account.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-outline">Cancel</button>
              <button onClick={() => deleteUser.mutate(confirm._id)} disabled={deleteUser.isPending} className="btn-primary">
                {deleteUser.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
