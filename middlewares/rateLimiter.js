import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
});

export const otpLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,
    max: 3,
    message: 'Too many OTP requests. Please try again after 2 minutes.',
});