import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);

    logger.info('Connected to MongoDB');
    console.log(`MongoDB server Connected`);
  } catch (error) {
    logger.error('Error connecting to MongoDB', error);
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
