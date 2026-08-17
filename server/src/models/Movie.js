import mongoose from 'mongoose';

const castSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    character: { type: String, default: '' },
    photo: { type: String, default: '' },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    tmdbId: { type: Number, index: true, sparse: true, unique: true }, // source id from TMDB (if imported)
    title: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    poster: { type: String, default: '' },
    backdrop: { type: String, default: '' },
    trailer: { type: String, default: '' }, // YouTube video id
    videoUrl: { type: String, default: '' }, // streamable source (demo)

    releaseDate: { type: Date },
    year: { type: Number, index: true },
    runtime: { type: Number, default: 0 }, // minutes

    genres: { type: [String], default: [], index: true },
    cast: { type: [castSchema], default: [] },
    director: { type: String, default: '' },

    language: { type: String, default: 'English' },
    country: { type: String, default: 'USA' },
    rating: { type: Number, default: 0, min: 0, max: 10 }, // avg critic/imdb-style
    contentRating: { type: String, default: 'PG-13' }, // G, PG, PG-13, R…
    quality: { type: String, enum: ['SD', 'HD', 'FHD', '4K'], default: 'HD' },

    // computed from user reviews
    userRatingAvg: { type: Number, default: 0 },
    userRatingCount: { type: Number, default: 0 },

    views: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 },

    type: { type: String, enum: ['movie', 'tv'], default: 'movie' },
    streamingStatus: { type: String, enum: ['available', 'coming_soon'], default: 'available' },
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Text index for search across title / description / director
movieSchema.index({ title: 'text', description: 'text', director: 'text' });

export default mongoose.model('Movie', movieSchema);
