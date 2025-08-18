import logger from '../utils/logger.js';
import Post from '../models/post.model.js';
import { ValidateCreatePost } from '../utils/validation.js';
import { publishEvent } from '../utils/rabbitmq.js';

const invalidatePostCache = async (req, input) => {
  const cachedKey = `posts:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys('posts:*');
  keys.forEach(async key => {
    await req.redisClient.del(key);
  });
};

const createPost = async (req, res) => {
  logger.info('Create post endpoint hit..');
  try {
    const { error } = ValidateCreatePost(req.body);
    if (error) {
      logger.warn('Validation error', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { content, mediaIds } = req.body;
    let newPost = await Post.create({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    //publish save event
    await publishEvent('post.created', {
      postId: newPost._id.toString(),
      userId: newPost.user.toString(),
      content: newPost.content,
      createdAt: newPost.createdAt,
    });

    //invalidate redis post
    await invalidatePostCache(req, newPost._id.toString());
    logger.info('Post created successfully', newPost);
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: newPost,
    });
  } catch (error) {
    logger.error('Error creating post', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cachekey = `posts:${page}:${limit}`;

    const cachedPosts = await req.redisClient.get(cachekey);
    if (cachedPosts) {
      return res.status(200).json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalPosts = await Post.countDocuments();

    const result = {
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      limit,
      posts,
    };

    //save posts in redis client
    await req.redisClient.setex(cachekey, 300, JSON.stringify(result));

    logger.info('Posts fetched successfully', posts);
    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      result,
    });
    await Post.find({});
  } catch (error) {
    logger.error('Error fetching posts', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
    });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const cachekey = `posts:${postId}`;

    const cachedPost = await req.redisClient.get(cachekey);
    if (cachedPost) {
      return res.status(200).json(JSON.parse(cachedPost));
    }
    const post = await Post.findById(postId);

    if (!post) {
      logger.warn('Post not found');
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    //save posts in redis client
    await req.redisClient.setex(cachekey, 3600, JSON.stringify(post));

    logger.info('Post fetched successfully', post);
    return res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      post,
    });
  } catch (error) {
    logger.error('Error fetching a single post', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching a single post',
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findOneAndDelete({
      _id: postId,
      user: req.user.userId,
    });

    if (!post) {
      logger.warn('Post not found');
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }
    //publish post delete method

    await publishEvent('post.deleted', {
      postId: post._id.toString(),
      userId: req.user.userId.toString(),
      mediaIds: post.mediaIds,
    });

    //invalidate redis post
    await invalidatePostCache(req, postId.toString());

    logger.info('Post deleted successfully', post);
    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      post,
    });
  } catch (error) {
    logger.error('Error deleting a single post', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting a single post',
    });
  }
};

export { createPost, getAllPosts, getSinglePost, deletePost };
