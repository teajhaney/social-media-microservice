import express from 'express';
import { authenticateRequest } from '../middlewares/auth.middleware';
import { uploadMedia } from '../controllers/media.controller';
import multer from 'multer';

const router = express.Router();

router.use(authenticateRequest);

router.get('/upload-media', uploadMedia);

export default router;
