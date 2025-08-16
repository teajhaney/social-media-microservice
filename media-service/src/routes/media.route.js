import express from 'express';
import multer from 'multer';

import { authenticateRequest } from '../middlewares/auth.middleware.js';
import { uploadMedia } from '../controllers/media.controller.js';
import logger from '../utils/logger.js';

const router = express.Router();

//configure multer for file upload

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, //5MB
}).single('media');

router.use(authenticateRequest);

router.get(
  '/upload',
  authenticateRequest,
  (req, res, next) => {
    upload(req, res, function (error) {
      if (error instanceof multer.MulterError) {
        logger.error('Multer Error while uploading media', error);
        res.status(400).json({
          success: false,
          message: 'Multer Error while uploading media',
          error: error.message,
          stack: error.stack,
        });
      } else if (error) {
        logger.error('Unknown Error occured while uploading media', error);
        res.status(500).json({
          success: false,
          message: 'Unknown Error occured while uploading media',
          error: error.message,
          stack: error.stack,
        });
      }
      if (!req.file) {
        logger.error('No file found!!');
        res.status(400).json({
          success: false,
          message: 'No file found!!',
        });
      }
      next();
    });
  },
  uploadMedia
);

export default router;
