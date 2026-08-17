import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, default: '', trim: true, maxlength: 2000 },
    reported: { type: Boolean, default: false },
    reportReason: { type: String, default: '' },
  },
  { timestamps: true }
);

// One review per user per movie
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
