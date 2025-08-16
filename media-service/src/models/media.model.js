import { Schema, model } from 'mongoose';

const mediaSchema = new Schema(
  {
    publicId: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timeseries: true }
);

const Media = model('Media', mediaSchema);

export default Media;

//
