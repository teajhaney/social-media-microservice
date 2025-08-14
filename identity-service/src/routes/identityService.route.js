import express from 'express';
import {
  registerUser,
  loginUser,
  userRefreshToken,
  logoutUser,
} from '../controllers/identity.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh-token', userRefreshToken);
router.post('/logout', logoutUser);

export default router;
