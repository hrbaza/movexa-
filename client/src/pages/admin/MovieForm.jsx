import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieApi, genreApi } from '../../services/endpoints.js';
import { useToast } from '../../context/ToastContext.jsx';
import { PageLoader } from '../../components/Spinner.jsx';
import { Trash } from '../../components/Icons.jsx';

const QUALITIES = ['SD', 'HD', 'FHD', '4K'];
const CONTENT_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

const EMPTY = {
  title: '', description: '', year: new Date().getFullYear(), runtime: 100,
  director: '', language: 'English', country: 'USA', rating: 7,
  contentRating: 'PG-13', quality: 'HD', trailer: '', videoUrl: '',
  poster: '', backdrop: '', genres: [], cast: [],
  published: true, featured: false, trending: false,
};

export default function MovieForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const { data: genreData } = useQuery({ queryKey: ['genres'], queryFn: genreApi.list });
  const { data: movieData, isLoading } = useQuery({
    queryKey: ['admin-movie', id],
    queryFn: () => movieApi.get(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (movieData?.movie) {
      const m = movieData.movie;
      setForm({ ...EMPTY, ...m, genres: m.genres || [], cast: m.cast || [] });
    }
  }, [movieData]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleGenre = (name) =>
    set('genres', form.genres.includes(name) ? form.genres.filter((g) => g !== name) : [...form.genres, name]);

  const updateCast = (i, key, val) => {
    const cast = [...form.cast];
    cast[i] = { ...cast[i], [key]: val };
    set('cast', cast);
  };
  const addCast = () => set('cast', [...form.cast, { name: '', character: '' }]);
  const removeCast = (i) => set('cast', form.cast.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (form.genres.length === 0) return toast.error('Pick at least one genre');
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year),
        runtime: Number(form.runtime),
        rating: Number(form.rating),
        releaseDate: `${form.year}-01-01`,
        cast: form.cast.filter((c) => c.name?.trim()),
      };
      if (isEdit) {
        await movieApi.update(id, payload);
        toast.success('Movie updated');
      } else {
        await movieApi.create(payload);
        toast.success('Movie created');
      }
      navigate('/admin/movies');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) return <PageLoader />;

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/admin/movies')} className="mb-4 text-sm text-muted hover:text-white">← Back to movies</button>
      <h1 className="font-display text-2xl font-extrabold">{isEdit ? 'Edit Movie' : 'Add Movie'}</h1>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="card-surface space-y-4 p-5">
          <Field label="Title *">
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="input" required />
          </Field>
          <Field label="Description">
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className="input resize-none" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Year"><input type="number" value={form.year} onChange={(e) => set('year', e.target.value)} className="input" /></Field>
            <Field label="Runtime (min)"><input type="number" value={form.runtime} onChange={(e) => set('runtime', e.target.value)} className="input" /></Field>
            <Field label="Rating (0–10)"><input type="number" step="0.1" min="0" max="10" value={form.rating} onChange={(e) => set('rating', e.target.value)} className="input" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Director"><input value={form.director} onChange={(e) => set('director', e.target.value)} className="input" /></Field>
            <Field label="Language"><input value={form.language} onChange={(e) => set('language', e.target.value)} className="input" /></Field>
            <Field label="Country"><input value={form.country} onChange={(e) => set('country', e.target.value)} className="input" /></Field>
            <Field label="Content rating">
              <select value={form.contentRating} onChange={(e) => set('contentRating', e.target.value)} className="input">
                {CONTENT_RATINGS.map((r) => <option key={r} className="bg-elevated">{r}</option>)}
              </select>
            </Field>
            <Field label="Quality">
              <select value={form.quality} onChange={(e) => set('quality', e.target.value)} className="input">
                {QUALITIES.map((q) => <option key={q} className="bg-elevated">{q}</option>)}
              </select>
            </Field>
          </div>
        </div>

        {/* Genres */}
        <div className="card-surface p-5">
          <p className="mb-3 text-sm font-semibold">Genres *</p>
          <div className="flex flex-wrap gap-2">
            {genreData?.items?.map((g) => (
              <button
                type="button"
                key={g._id}
                onClick={() => toggleGenre(g.name)}
                className={`chip ${form.genres.includes(g.name) ? 'chip-active' : ''}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Media */}
        <div className="card-surface space-y-4 p-5">
          <p className="text-sm font-semibold">Media</p>
          <Field label="Trailer (YouTube video ID)"><input value={form.trailer} onChange={(e) => set('trailer', e.target.value)} className="input" placeholder="e.g. YoHD9XEInc0" /></Field>
          <Field label="Video URL (stream source)"><input value={form.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} className="input" placeholder="https://…/movie.mp4" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Poster URL (optional)"><input value={form.poster} onChange={(e) => set('poster', e.target.value)} className="input" placeholder="Leave blank for auto art" /></Field>
            <Field label="Backdrop URL (optional)"><input value={form.backdrop} onChange={(e) => set('backdrop', e.target.value)} className="input" placeholder="Leave blank for auto art" /></Field>
          </div>
        </div>

        {/* Cast */}
        <div className="card-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Cast</p>
            <button type="button" onClick={addCast} className="chip">+ Add cast</button>
          </div>
          <div className="space-y-2">
            {form.cast.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input value={c.name} onChange={(e) => updateCast(i, 'name', e.target.value)} placeholder="Actor name" className="input flex-1" />
                <input value={c.character} onChange={(e) => updateCast(i, 'character', e.target.value)} placeholder="Character" className="input flex-1" />
                <button type="button" onClick={() => removeCast(i)} className="rounded-lg px-3 text-muted hover:text-brand-light" aria-label="Remove">
                  <Trash width={16} height={16} />
                </button>
              </div>
            ))}
            {form.cast.length === 0 && <p className="text-sm text-muted">No cast added.</p>}
          </div>
        </div>

        {/* Flags */}
        <div className="card-surface flex flex-wrap gap-6 p-5">
          <Check label="Published" checked={form.published} onChange={(v) => set('published', v)} />
          <Check label="Featured (hero)" checked={form.featured} onChange={(v) => set('featured', v)} />
          <Check label="Trending" checked={form.trending} onChange={(v) => set('trending', v)} />
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate('/admin/movies')} className="btn-outline">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary px-6">
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create movie'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-brand" />
      <span className="text-sm">{label}</span>
    </label>
  );
}
