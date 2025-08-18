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
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

searchSchema.index({ content: 'text' });
searchSchema.index({ createdAt: -1 });

const Search = model('Search', searchSchema);

export default Search;
