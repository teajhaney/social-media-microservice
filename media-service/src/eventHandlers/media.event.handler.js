import Media from '../models/media.model.js';
import { deleteMediaFromCloudinary } from '../utils/cloudinary.js';
import logger from '../utils/logger.js';

export const handlePostDeleted = async event => {
  console.log(event, 'eventtttttttt...');
  const { postId, mediaIds } = event;
  try {
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);

      logger.info(
        `Media with id ${media._id} associated with post ${postId} has been deleted`
      );
    }

    logger.info(`Post with id ${postId} has been deleted`);
  } catch (error) {
    logger.error('Error while deleting media', error);
  }
};
