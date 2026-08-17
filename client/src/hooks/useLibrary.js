import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { libraryApi } from '../services/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function useWatchlist() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: () => libraryApi.watchlist().then((d) => d.items),
    enabled: isAuthenticated,
  });
}

export function useFavorites() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => libraryApi.favorites().then((d) => d.items),
    enabled: isAuthenticated,
  });
}

export function useHistory() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['history'],
    queryFn: () => libraryApi.history().then((d) => d.items),
    enabled: isAuthenticated,
  });
}

export function useContinueWatching() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['continue'],
    queryFn: () => libraryApi.continueWatching().then((d) => d.items),
    enabled: isAuthenticated,
  });
}

export function useLibraryStatus(movieId) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['library-status', movieId],
    queryFn: () => libraryApi.status(movieId),
    enabled: isAuthenticated && Boolean(movieId),
  });
}

/** Toggle watchlist / favorites with optimistic-ish invalidation + toasts. */
export function useLibraryActions() {
  const qc = useQueryClient();
  const toast = useToast();

  const invalidate = (movieId) => {
    qc.invalidateQueries({ queryKey: ['watchlist'] });
    qc.invalidateQueries({ queryKey: ['favorites'] });
    if (movieId) qc.invalidateQueries({ queryKey: ['library-status', movieId] });
  };

  const toggleWatchlist = useMutation({
    mutationFn: ({ movieId, active }) =>
      active ? libraryApi.removeWatchlist(movieId) : libraryApi.addWatchlist(movieId),
    onSuccess: (_res, { movieId, active }) => {
      invalidate(movieId);
      toast.success(active ? 'Removed from watchlist' : 'Added to watchlist');
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleFavorite = useMutation({
    mutationFn: ({ movieId, active }) =>
      active ? libraryApi.removeFavorite(movieId) : libraryApi.addFavorite(movieId),
    onSuccess: (_res, { movieId, active }) => {
      invalidate(movieId);
      toast.success(active ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: (e) => toast.error(e.message),
  });

  return { toggleWatchlist, toggleFavorite };
}
