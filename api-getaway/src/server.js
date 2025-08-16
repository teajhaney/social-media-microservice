import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import proxy from 'express-http-proxy';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import validateToken from './middleware/auth.middleware.js';

const app = express();
const PORT = process.env.PORT || 3000;

const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

//rate limitng
const endpointRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
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

app.use(endpointRateLimit);

app.use((req, res, next) => {
  logger.info(`Received : ${req.method} ${req.url}`);
  logger.info(`Request body : ${req.body}`);
  next();
});

//proxy options
const proxyOptions = {
  changeOrigin: true,
  proxyReqPathResolver: req => {
    return req.originalUrl.replace(/^\/v1/, '/api');
  },

  proxyErrorHandler: (err, res) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: 'Proxy  server error',
      error: err.message,
    });
  },
};

//setting up proxy for identity service
app.use(
  '/v1/auth',
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    target: process.env.IDENTITY_SERVICE_URL,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['Content-Type'] = 'application/json';
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from identity services: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

//setting up proxy for post service
app.use(
  '/v1/posts',
  validateToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    target: process.env.POST_SERVICE_URL,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['Content-Type'] = 'application/json';
      proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from post services: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

//settings up proxy for media service
app.use(
  '/v1/media',
  validateToken,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    target: process.env.MEDIA_SERVICE_URL,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers['x-user-id'] = srcReq.user.userId;
      if (!srcReq.headers['content-type'].includes('multipart/form-data')) {
        proxyReqOpts.headers['Content-Type'] = 'application/json';
      }
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from media services: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
    parseReqBody: false,
  })
);

//error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(
    `identity service is running on port ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(
    `Post service is running on port ${process.env.POST_SERVICE_URL}`
  );
  logger.info(
    `Media service is running on port ${process.env.MEDIA_SERVICE_URL}`
  );
  logger.info(`Redis url${process.env.REDIS_URL}`);
});
