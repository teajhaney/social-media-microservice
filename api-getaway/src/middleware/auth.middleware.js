import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const validateToken = (req, res, next) => {
  const authheader = req.headers['authorization'];
  const token = authheader && authheader.split(' ')[1];
  if (!token) {
    logger.warn('Access attempted without valid token');
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.warn('Invalid token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    req.user = user;
    next();
  });
};

export default validateToken;
