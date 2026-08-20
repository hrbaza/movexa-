import api from './api.js';

const data = (p) => p.then((r) => r.data);

export const authApi = {
  register: (body) => data(api.post('/auth/register', body)),
  login: (body) => data(api.post('/auth/login', body)),
  me: () => data(api.get('/auth/me')),
  updateMe: (body) => data(api.put('/auth/me', body)),
  forgotPassword: (body) => data(api.post('/auth/forgot-password', body)),
  resetPassword: (body) => data(api.post('/auth/reset-password', body)),
};

export const movieApi = {
  home: () => data(api.get('/movies/home')),
  list: (params) => data(api.get('/movies', { params })),
  get: (idOrSlug) => data(api.get(`/movies/${idOrSlug}`)),
  getTmdb: (tmdbId) => data(api.get(`/movies/tmdb/${tmdbId}`)),
  create: (body) => data(api.post('/movies', body)),
  update: (id, body) => data(api.put(`/movies/${id}`, body)),
  remove: (id) => data(api.delete(`/movies/${id}`)),
  reviews: (idOrSlug) => data(api.get(`/movies/${idOrSlug}/reviews`)),
  addReview: (idOrSlug, body) => data(api.post(`/movies/${idOrSlug}/reviews`, body)),
};

export const reviewApi = {
  update: (id, body) => data(api.put(`/reviews/${id}`, body)),
  remove: (id) => data(api.delete(`/reviews/${id}`)),
  report: (id, reason) => data(api.post(`/reviews/${id}/report`, { reason })),
};

export const genreApi = {
  list: () => data(api.get('/genres')),
  get: (slug) => data(api.get(`/genres/${slug}`)),
};

export const searchApi = {
  query: (q) => data(api.get('/search', { params: { q } })),
};

export const subtitleApi = {
  search: (tmdbId, language = '') =>
    data(api.get(`/subtitles/${tmdbId}`, { params: language ? { language } : {} })),
};

export const libraryApi = {
  watchlist: () => data(api.get('/watchlist')),
  addWatchlist: (id) => data(api.post(`/watchlist/${id}`)),
  removeWatchlist: (id) => data(api.delete(`/watchlist/${id}`)),
  favorites: () => data(api.get('/favorites')),
  addFavorite: (id) => data(api.post(`/favorites/${id}`)),
  removeFavorite: (id) => data(api.delete(`/favorites/${id}`)),
  status: (id) => data(api.get(`/library/status/${id}`)),
  history: () => data(api.get('/history')),
  continueWatching: () => data(api.get('/history/continue')),
  saveProgress: (body) => data(api.post('/history', body)),
  removeHistory: (id) => data(api.delete(`/history/${id}`)),
};

export const adminApi = {
  dashboard: () => data(api.get('/admin/dashboard')),
  analytics: () => data(api.get('/admin/analytics')),
  users: (params) => data(api.get('/admin/users', { params })),
  user: (id) => data(api.get(`/admin/users/${id}`)),
  updateUser: (id, body) => data(api.put(`/admin/users/${id}`, body)),
  deleteUser: (id) => data(api.delete(`/admin/users/${id}`)),
  movies: (params) => data(api.get('/admin/movies', { params })),
  reportedReviews: () => data(api.get('/admin/reviews')),
  tmdbStatus: () => data(api.get('/admin/tmdb/status')),
  tmdbSearch: (q) => data(api.get('/admin/tmdb/search', { params: { q } })),
  tmdbImport: (tmdbId) => data(api.post(`/admin/tmdb/import/${tmdbId}`)),
};
