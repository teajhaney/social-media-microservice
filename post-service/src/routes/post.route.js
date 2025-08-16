import express from 'express';
import {
  createPost,
  getAllPosts,
  getSinglePost,
  deletePost,
} from '../controllers/post.controller.js';
import { authenticateRequest } from '../middlewares/auth.middleware.js';

const router = express.Router();

//auth middleware
router.use(authenticateRequest);

router.post('/create', createPost);
router.get('/get', getAllPosts);
router.get('/:postId', getSinglePost);
router.delete('/delete/:postId', deletePost);

export default router;
