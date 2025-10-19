import express from 'express';
import { 
    signupController, 
    loginController, 
    OTPVerifyController, 
    getUser,
    forgotPasswordController,
    resetPasswordController
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signupController);
router.post('/login', loginController);
router.post('/otp-verify', OTPVerifyController);
router.post('/forgot-password', forgotPasswordController);
router.post('/reset-password', resetPasswordController);
router.get('/me', getUser);

export default router;