import mongoose from 'mongoose';

/**
 * Watchlist + Favorites share the same shape (a user↔movie link),
 * so they use one schema factory.
 */
function linkSchema() {
  const schema = new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
      movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    },
    { timestamps: true }
  );
  schema.index({ user: 1, movie: 1 }, { unique: true });
  return schema;
}

export const Watchlist = mongoose.model('Watchlist', linkSchema());
export const Favorite = mongoose.model('Favorite', linkSchema());

const historySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    position: { type: Number, default: 0 }, // seconds watched
    duration: { type: Number, default: 0 }, // total seconds
    completion: { type: Number, default: 0 }, // 0..100
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
historySchema.index({ user: 1, movie: 1 }, { unique: true });

export const History = mongoose.model('History', historySchema);
