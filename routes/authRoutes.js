import express from 'express';
import { signupController, loginController, OTPVerifyController, getUser } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { otpLimiter } from '../middlewares/rateLimiter.js';
const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/otp-verify', otpLimiter, OTPVerifyController);
router.get('/me', authMiddleware, getUser);
export default router;