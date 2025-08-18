import Search from '../models/search.model.js';
import logger from '../utils/logger.js';

export const handleSaveToSearchEvent = async event => {
	logger.info('save post to search event received')
  const { postId, userId, content, createdAt } = event;
  try {
    const post = await Search.create({
      postId,
      userId,
      content,
      createdAt,
    });

    logger.info(`Post with id ${postId} has been saved to search`, post);
  } catch (error) {
    logger.error('Error while saving post to search ', error);
  }
};

export const handleDeleteFromSearch = async event => {
	logger.info('delete post from search event received')
  const { postId } = event;
  try {
    const post = await Search.findOneAndDelete({
      postId,
    });

    logger.info(`Post with id ${postId} has been deleted from search`, post);
  } catch (error) {
    logger.error('Error while deleting post from search ', error);
  }
};
