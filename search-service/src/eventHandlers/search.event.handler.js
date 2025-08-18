import Search from '../models/search.model.js';
import logger from '../utils/logger.js';

export const handleSaveToSearchEvent = async event => {
  console.log(event, 'eventtttttttt...');
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
