import { Schema, model } from 'mongoose';

const searchSchema = new Schema(
  {
    postId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { timestamps: true }
);

searchSchema.index({ content: 'text' });
searchSchema.index({ createdAt : -1 });

export const Search = model('Search', searchSchema);
