import dotevn from 'dotenv';
dotevn.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisStore } from 'rate-limit-redis';
import { rateLimit } from 'express-rate-limit';

import connectDB from './database/connectDB.js';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorHandler.js';
import mediaRoutes from './routes/media.route.js';

const PORT = process.env.PORT || 3003;
const app = express();
connectDB();
const redisClient = new redis(process.env.REDIS_URL);
//use middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received : ${req.method} ${req.url}`);
  logger.info(`Request body : ${req.body}`);
  next();
});

//DDos protection and rate limiter

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 50,
  duration: 10,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      logger.error(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: 'Too many requests',
      });
    });
});

//Ip base rate limiting fir sensitive endpoint

const sensitiveEndpointLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests',
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

//apply sensitve endpoint to our routes
app.use('/api/media/upload', sensitiveEndpointLimiter);

//Routes-> pass redisclient to route
app.use(
  '/api/media',
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  mediaRoutes
);

//error handler middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  logger.info(
    `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
  );
});

//unhandle promise rejection handler

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason', reason);
});




