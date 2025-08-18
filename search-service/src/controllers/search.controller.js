import logger from '../utils/logger';
import Search from '../models/search.model.js';

const searchController = async (req, res) => {
  logger.info('Search endpoint hit...');
  try {
    const { query } = req.query;
    // const queryResult = await Search.find({
    //   content: { $regex: query, $options: 'i' },
    // });
    const queryResult = await Search.find(
      {
        $text: { $search: query },
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(10);

    if (!queryResult) {
      logger.error('Query is empty');
      res.status(500).json({
        success: false,
        message: 'Query is empty',
      });
    }

    logger.info('post search successful');
    res.status(200).json({
      success: true,
      message: 'post search successful',
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
