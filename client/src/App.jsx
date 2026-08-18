import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import TopProgressBar from './components/TopProgressBar.jsx';

import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import Watch from './pages/Watch.jsx';
import SearchPage from './pages/SearchPage.jsx';
import Genres from './pages/Genres.jsx';
import GenrePage from './pages/GenrePage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import Profile from './pages/Profile.jsx';
import Watchlist from './pages/Watchlist.jsx';
import Favorites from './pages/Favorites.jsx';
import History from './pages/History.jsx';
import Legal from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminMovies from './pages/admin/AdminMovies.jsx';
import MovieForm from './pages/admin/MovieForm.jsx';
import AdminImport from './pages/admin/AdminImport.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminReviews from './pages/admin/AdminReviews.jsx';

export default function App() {
  return (
    <>
      <TopProgressBar />
      <ScrollToTop />
      <Routes>
        {/* Player is full-bleed, outside the main layout chrome */}
        <Route
          path="/watch/:slug"
          element={
            <ProtectedRoute>
              <Watch />
            </ProtectedRoute>
          }
        />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Browse />} />
          <Route path="/movie/:slug" element={<MovieDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/genre/:slug" element={<GenrePage />} />
          <Route path="/legal/:doc" element={<Legal />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute admin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="movies" element={<AdminMovies />} />
          <Route path="movies/new" element={<MovieForm />} />
          <Route path="movies/:id/edit" element={<MovieForm />} />
          <Route path="import" element={<AdminImport />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>

        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  );
}
