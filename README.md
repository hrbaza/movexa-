# 🎬 Movexa — Movie Streaming Platform

A modern, responsive, dark-cinematic movie streaming platform built on the **MERN** stack
(MongoDB · Express · React · Node) as specified in the project SRS.

This is the **MVP** release: user site + admin dashboard, running fully offline with a
**no-install in-memory MongoDB** that auto-seeds sample data on first boot.

---

## ✨ Features (MVP)

**User site**
- Dark cinematic homepage — hero, trending, popular, latest, top-rated, genres, recommended
- Browse with filters (genre, year, rating, language, quality) + sorting
- Full-text-ish search (movies, cast, directors, genres)
- Movie details — backdrop, cast, trailer, reviews, similar titles
- Trailer modal (YouTube) + custom HTML5 video player (play/pause, volume, speed, quality menu, fullscreen, resume)
- Auth — register, login, logout, forgot/reset password (JWT)
- Watchlist · Favorites · Watch history + Continue Watching
- Star ratings + write/edit/delete reviews
- Responsive across mobile / tablet / desktop

**Admin dashboard**
- Stats overview (users, movies, views, reviews)
- Movie management — create / edit / publish / feature / delete
- User management — search, change role, suspend/activate

---

## 🧱 Tech Stack

| Layer     | Tech |
|-----------|------|
| Frontend  | React 18, Vite, Tailwind CSS, React Router, TanStack Query, Axios |
| Backend   | Node.js, Express, JWT, bcrypt, Helmet, express-rate-limit |
| Database  | MongoDB via Mongoose — **in-memory (mongodb-memory-server)** by default, Atlas-ready |

---

## 🚀 Getting Started

**Requirements:** Node.js 18+ (you have v22 ✓). MongoDB install **not** required.

```bash
# 1. Install all dependencies (root + server + client)
npm run install:all

# 2. Start backend + frontend together
npm run dev
```

- Frontend → http://localhost:5173
- Backend API → http://localhost:5000/api

> **First run only:** the backend downloads the MongoDB engine used by
> `mongodb-memory-server` (~500–600 MB) — this needs internet once and is then cached at
> `~/.cache/mongodb-binaries`, so every later boot is fast and fully offline. Give the first
> `npm run dev` a few minutes; watch the terminal for `✅ MongoDB connected`. The database
> auto-seeds ~30 sample movies, genres, and the demo accounts on every boot.
>
> Prefer to skip the download? Set `MONGODB_URI` in `server/.env` to a MongoDB Atlas cluster
> (free tier works) and the server connects there instead — no binary needed.

### Demo accounts (auto-seeded)

| Role  | Email               | Password    |
|-------|---------------------|-------------|
| Admin | `admin@movexa.test` | `admin123`  |
| User  | `user@movexa.test`  | `user123`   |

---

## 🎥 Real movie data (TMDB)

Movexa can pull real movie metadata — posters, backdrops, cast, trailers — from
[The Movie Database](https://www.themoviedb.org).

1. Create a free API key at **themoviedb.org → Settings → API** (a v3 key or v4 token both work).
2. Add it to `server/.env`:
   ```
   TMDB_API_KEY=your_key_here
   ```
3. Restart (`npm run dev`). On a fresh database the catalog is now **seeded from live TMDB**
   (popular / top-rated / trending). Without a key, Movexa uses bundled sample data instead —
   it never breaks.

You can also import titles on demand: sign in as admin → **Admin → Import from TMDB** →
search and click **Import**. The key stays server-side and is never exposed to the browser.

## 🔌 Switching to a real database (MongoDB Atlas)

Create `server/.env` (copy from `server/.env.example`) and set:

```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/movexa
```

When `MONGODB_URI` is present the server uses it instead of the in-memory DB, and your data
persists across restarts.

---

## 📁 Project Structure

```
movexa/
├── client/          # React + Vite + Tailwind frontend
│   └── src/
│       ├── components/  pages/  layouts/  hooks/
│       ├── services/    context/  utils/
├── server/          # Node + Express REST API
│   └── src/
│       ├── config/  models/  controllers/  routes/
│       ├── middleware/  seed/  utils/
└── package.json     # root — runs both with `npm run dev`
```

---

## ⚖️ Legal

Per the SRS, Movexa only streams content the operator is licensed to distribute. Sample data
uses public movie **metadata**, trailer links, and Creative-Commons demo video for the player.
No pirated or unauthorized sources are included.
