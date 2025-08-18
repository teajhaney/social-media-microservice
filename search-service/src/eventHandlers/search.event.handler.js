import Search from '../models/search.model.js';
import logger from '../utils/logger.js';

const invalidateSearchCache = async (req, input) => {
  const cachedKey = `search:${input}`;
  await req.redisClient.del(cachedKey);

  const searchKeys = await req.redisClient.keys('search:*');
  searchKeys.forEach(async key => {
    await req.redisClient.del(key);
  });
};

export const handleSaveToSearchEvent = async event => {
  logger.info('save post to search event received');
  const { postId, userId, content, createdAt } = event;
  try {
    const post = await Search.create({
      postId,
      userId,
      content,
      createdAt,
    });

    await invalidateSearchCache(req, postId.toString());

    logger.info(`Post with id ${postId} has been saved to search`, post);
  } catch (error) {
    logger.error('Error while saving post to search ', error);
  }
};

export const handleDeleteFromSearch = async event => {
  logger.info('delete post from search event received');
  const { postId } = event;
  try {
    const post = await Search.findOneAndDelete({
      postId,
    });

    await invalidateSearchCache(req, postId.toString());

    logger.info(`Post with id ${postId} has been deleted from search`, post);
  } catch (error) {
    logger.error('Error while deleting post from search ', error);
  }
};
