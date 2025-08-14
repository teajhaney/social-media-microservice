import logger from '../utils/logger.js';
import Post from '../models/post.model.js';
import { ValidateCreatePost } from '../utils/validation.js';
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
    const newPost = await Post.create({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });
    logger.info('Post created successfully', newPost);
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
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
  } catch (error) {
    logger.error('Error deleting a single post', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting a single post',
    });
  }
};

export { createPost, getAllPosts, getSinglePost, deletePost };
