import { Schema, model } from 'mongoose';

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // mediaIds: [{ type: String }],
    mediaIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Media',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// beacuse there will be another mkcroservice for service, it is important to create an index

postSchema.index({ content: 'text' });

const Post = model('Post', postSchema);

export default Post;
