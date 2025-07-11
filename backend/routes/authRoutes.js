import express from 'express';

import protect from '../middleware/authMiddleware.js';
import { getProfile, loginUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

export default router;
