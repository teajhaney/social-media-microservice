import dotenv from 'dotenv';
dotenv.config();

import cloudinary from 'cloudinary';

import logger from '../utils/logger.js';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async file => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          logger.error('Error while uploading to cloudinary', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudinary = async publicId => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    logger.info('Media deleted from cloudinary', publicId);
    return result;
  } catch (error) {
    logger.error('Error while deleting media from cloudinary', error);
    throw error;
  }
};

export { uploadMediaToCloudinary };
