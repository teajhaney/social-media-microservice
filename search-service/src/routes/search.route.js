import express from 'express';
import { searchController } from '../controllers/search.controller.js';
import { authenticateRequest } from '../middlewares/auth.middleware.js';
const router = express.Router();

router.use('/posts', authenticateRequest, searchController);

export default router;
