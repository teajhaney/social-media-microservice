import logger from '../utils/logger.js';
import { uplaodMediaToCloudinary } from '../utils/cloudinary.js';
import Media from '../models/media.model.js';

export const uploadMedia = async (req, res) => {
  logger.info('Starting media upload..');
  try {
    //check if file is available in req
    if (!req.file) {
      logger.error('No file uploaded, add a file and try again!!');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload an image.',
      });
    }
    const { originalName, mimetype, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: ${originalName}, ${mimetype}`);
    logger.info('uploading file to cloudinary...');

    const { secure_url, public_id } = await uplaodMediaToCloudinary(
      req.file.part
    );
    logger.info(`cloudinary upload successful , public id: - ${public_id}}`);
    const uploadedMedia = await Media.create({
      url: secure_url,
      publicId: public_id,
      originalName,
      mimeType: mimetype,
      user: userId,
    });

    logger.info('Media uploaded to  to database');
    //delete from local Storage
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: uploadedMedia,
    });
  } catch (error) {
    logger.error('Error uplaoding media posts', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading media posts',
    });
  }
};
