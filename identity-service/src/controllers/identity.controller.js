import logger from '../utils/logger.js';
import { validateLogin, validateRegistration } from '../utils/validation.js';
import generateTokens from '../utils/generateToken.js';
import User from '../models/user.model.js';
import RefreshToken from '../models/refreshToken.model.js';

//user registration

export const registerUser = async (req, res) => {
  logger.info('Registration endpoint hit...');
  try {
    //validate the schema
    const { error } = validateRegistration(req.body);
    if (error) {
      logger.warn('Validation error', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password, username } = req.body;
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      logger.warn('User already exists');
      return res.status(400).json({
        success: false,
        message: 'User already exist',
      });
    }

    user = await User.create({
      email,
      password,
      username,
    });

    logger.info('User created successfully', user._id);

    const { accessToken, refreshToken } = await generateTokens(user);
    return res.status(201).json({
      success: true,
      message: 'User created succcessfully',
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error occured', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//user login
export const loginUser = async (req, res) => {
  logger.info('Login endpoint hit...');
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      logger.warn('Validation error', error.details[0].message);
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logger.warn('User not found');
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    //validate password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn('User not found');
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    logger.info('User logged in successfully', user._id);
    const { accessToken, refreshToken } = await generateTokens(user);
    return res.status(201).json({
      success: true,
      message: 'User logged in succcessfully',
      accessToken,
      refreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error('Login error occured', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//refresh token
export const userRefreshToken = async (req, res) => {
  logger.info('Refresh token endpoint hit...');
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn('Refresh token not found');
      return res.status(400).json({
        success: false,
        message: 'Refresh token not found',
      });
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      logger.warn('Invalid or expired refresh token');
      return res.status(401).json({
        success: false,
        message: 'Refresh token invalid or expired',
      });
    }

    const user = await User.findById(storedToken.user);
    if (!user) {
      logger.warn('User not found');
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user
    );

    //delete the old refreshTokem
    await RefreshToken.deleteOne({ _id: storedToken._id });
    //store the new refresh token
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken: newRefreshToken,
      userId: user._id,
    });
  } catch (error) {
    logger.error('refresh token error occured', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//logout

export const logoutUser = async (req, res) => {
  logger.info('Logout endpoint hit...');
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn('Refresh token not found');
      return res.status(400).json({
        success: false,
        message: 'Refresh token not found',
      });
    }
    await RefreshToken.deleteOne({ token: refreshToken });
    logger.info('Refresh token deleted successfully for logout');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error('logout error occured', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
