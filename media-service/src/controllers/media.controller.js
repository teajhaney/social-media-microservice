import logger from '../utils/logger.js';
import { uploadMediaToCloudinary } from '../utils/cloudinary.js';
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
    const { originalname, mimetype, buffer } = req.file;
    const userId = req.user.userId;

    logger.info(`File details: ${originalname}, ${mimetype}`);
    logger.info('uploading file to cloudinary...');

    const { secure_url, public_id } = await uploadMediaToCloudinary(req.file);

    // Add validation if needed
    if (!secure_url || !public_id) {
      throw new Error(
        'Cloudinary upload failed - no URL or public ID returned'
      );
    }

    logger.info(`cloudinary upload successful , public id: - ${public_id}`);

    const uploadedMedia = await Media.create({
      url: secure_url,
      publicId: public_id,
      originalName: originalname,
      mimeType: mimetype,
      user: userId,
    });

    logger.info('Media uploaded to  to database');

    res.status(201).json({
      success: true,
      message: 'Media uploaded successfully',
      data: uploadedMedia,
    });
  } catch (error) {
    logger.error('Error uplaoding media posts', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading media',
    });
  }
};

export const getAllMedia = async (req, res) => {
  try {
    const medias = await Media.find({});
    const count =await  Media.countDocuments();
    logger.info('Media fetched successfully', medias);
    res.status(200).json({
      success: true,
      message: 'Media fetched successfully',
      length: count,
      data: medias,
    });
  } catch (error) {
    logger.error('Error fetching media posts', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching media',
    });
  }
};
