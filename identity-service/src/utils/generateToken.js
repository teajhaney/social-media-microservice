import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/refreshToken.model.js';
import logger from '../utils/logger.js';
const generateTokens = async user => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: '60m' }
  );
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expres in 7 days
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt,
  });
  return { accessToken, refreshToken };
};
export default generateTokens;
