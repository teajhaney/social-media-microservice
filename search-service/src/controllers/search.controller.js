import logger from '../utils/logger.js';
import Search from '../models/search.model.js';

export const searchController = async (req, res) => {
  logger.info('Search endpoint hit...');
  try {
    const { query } = req.query;

    if (!query) {
      logger.error('Query is empty');
      res.status(500).json({
        success: false,
        message: 'Query is empty',
      });
    }

    const cachedKey = `search:${query}`;

    const cachedResults = await req.redisClient.get(cachedKey);
    if (cachedResults) {
      logger.info('Cache hit for search query:', query);
      return res.status(200).json({
        success: true,
        message: 'post search successful (from cache)',
        length: JSON.parse(cachedResults).length,
        data: JSON.parse(cachedResults),
      });
    }

    const queryResult = await Search.find(
      {
        $text: { $search: query },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    //save posts in redis client
    await req.redisClient.setex(cachedKey, 300, JSON.stringify(queryResult));

    logger.info('post search successful');
    res.status(200).json({
      success: true,
      message: 'post search successful',
      length: queryResult.length,
      data: queryResult,
    });
  } catch (error) {
    logger.error('Error searching post', error);
    res.status(500).json({
      success: false,
      message: 'Error while searching post',
    });
  }
};
