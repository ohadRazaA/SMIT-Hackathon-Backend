import express from 'express';
import { signupController, loginController, OTPVerifyController, getUser } from '../controllers/authController.js';
const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/otp-verify', OTPVerifyController);
router.get('/me', getUser);
export default router;