import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import OTPModel from "../models/otp.js";
import { sendMail } from "../utils.js";
import { configDotenv } from "dotenv";
configDotenv();

const JWT_PRIVATE_KEY = process.env.JWT_PRIVATE_KEY;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const BCRYPT_SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 5;

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        JWT_PRIVATE_KEY,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

const validateSignupInput = (firstName, lastName, email, password) => {
    const errors = [];
    
    if (!firstName?.trim()) errors.push('First name is required');
    if (!lastName?.trim()) errors.push('Last name is required');
    if (!email?.trim()) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push('Invalid email format');
    }
    
    if (password && password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    return errors;
};

const signupController = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const validationErrors = validateSignupInput(firstName, lastName, email, password);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                message: "Validation failed",
                errors: validationErrors
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const isExist = await userModel.findOne({ email: normalizedEmail });
        if (isExist) {
            return res.status(409).json({
                message: "Email already registered",
                data: null
            });
        }

        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const user = await userModel.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            type: 'user',
            isVerified: false
        });

        try {
            await sendMail(normalizedEmail, user);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        res.status(201).json({
            message: "User registered successfully! Please check your email for verification.",
            data: user
        });

    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }
        
        res.status(500).json({
            message: "Registration failed. Please try again later."
        });
    }
};

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await userModel.findOne({ email: normalizedEmail }).select('+password');
        
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid email or password' 
            });
        }

        if (!user.isVerified || user.TwoFAEnabled) {
            try {
                await sendMail(normalizedEmail, user);
            } catch (emailError) {
                console.error('OTP email sending failed:', emailError);
            }
            
            return res.status(200).json({
                message: user.isVerified 
                    ? "2FA code sent to your email" 
                    : "Please verify your email. OTP sent.",
                requiresVerification: true,
                data: user
            });
        }

        await userModel.findByIdAndUpdate(user._id, { 
            lastLoginAt: new Date()
        });

        const token = generateToken(user._id);

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: "Login successful",
            data: userResponse,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again later.' 
        });
    }
};

const OTPVerifyController = async (req, res) => {
    try {
        const { otp, email, id } = req.body;

        if (!otp || !email || !id) {
            return res.status(400).json({
                message: "OTP, email, and user ID are required"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const otpDoc = await OTPModel.findOne({ 
            email: normalizedEmail, 
            otp: otp.trim(),
            isUsed: false 
        });

        if (!otpDoc) {
            return res.status(401).json({
                message: "Invalid or expired OTP"
            });
        }

        const otpAge = Date.now() - otpDoc.createdAt.getTime();
        const otpExpiryMs = OTP_EXPIRY_MINUTES * 60 * 1000;
        
        if (otpAge > otpExpiryMs) {
            return res.status(401).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        otpDoc.isUsed = true;
        await otpDoc.save();

        const user = await userModel.findOneAndUpdate(
            { email: normalizedEmail, _id: id },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const token = generateToken(user._id);

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            message: "Account verified successfully",
            token,
            data: userResponse
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ 
            message: 'Verification failed. Please try again later.' 
        });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await userModel
            .findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            message: 'Server error. Please try again later.' 
        });
    }
};

export {
    signupController,
    loginController,
    OTPVerifyController,
    getUser,
    forgotPasswordController,
    resetPasswordController
};
