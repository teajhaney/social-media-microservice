import dotevn from 'dotenv';
dotevn.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import redis from 'ioredis';

import connectDB from './database/connectDB.js';
import logger from './utils/logger.js';
import errorHander from './middlewares/errorHandler.js';

const PORT = process.env.PORT || 3004;
const app = express();
connectDB();

//use middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(errorHander);

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`Server started on port`);
});
