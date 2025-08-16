import dotenv from 'dotenv';
dotenv.config();

import cloudinary from 'cloudinary';

import logger from '../utils/logger.js';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uplaodMediaToCloudinary = async file => {
  return new Promise((resolve, reject) => {
    const uplaodStream = cloudinary.uploader.upload_stream(
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
	  uplaodStream.end(file.buffer);
  });
};

export { uplaodMediaToCloudinary };
