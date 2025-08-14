import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import Redis from 'ioredis';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import connectDB from './database/connectDB.js';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger.js';
import authRoutes from './routes/identityService.route.js';

const app = express();
const PORT = process.env.PORT || 3001;
connectDB();
const redisClient = new Redis(process.env.REDIS_URL);

//middleware
app.use(helmet());
app.use(cors());
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
  points: 10,
  duration: 1,
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
app.use('/api/auth/register', sensitiveEndpointLimiter);

//Routes
app.use('/api/auth', authRoutes);

//error handler middleware
app.use(errorHandler);

app.listen(PORT, () => [
  logger.info(`Identity Server is running on port ${PORT}`),
]);

//unhandle promise rejection handler

process.on('unhandleRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, 'reason', reason);
});
