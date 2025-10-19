import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import OTPModel from "../models/otp.js";
import { sendMail } from "../utils/sendEmail.js";

const signupController = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const isExist = await userModel.findOne({ email });
        if (isExist) {
            return res.json({
                status: false,
                message: "Email Already Exist!",
                data: null
            })
        }

        if (!firstName || !lastName || !email || !password) {
            return res.status(401).json({
                message: "required field are missing"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const myUser = new userModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            roles: 'user'
        });
        const user = await userModel.create(myUser);

        await sendMail(user);

        res.status(201).json({
            message: "User registered successfully! Please check your email for verification."
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "required field are missing"
            })
        }

        const user = await userModel.findOne({ email });
        if (!user) return res.status(401).json({ message: 'INVALID EMAIL OR PASSWORD', status: false });


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'INVALID EMAIL OR PASSWORD', status: false });


        if (!user.isVerified || user.TwoFAEnabled) {
            await sendMail(user);
            return res.status(200).json({
                message: "USER VERIFIED",
                data: user,
                status: true,
            })
        }

        const PRIVATE_KEY = process.env.jwtPrivateKey
        const token = jwt.sign({ id: user._id }, PRIVATE_KEY)
        res.status(200).json({
            message: "USER SUCCESSFULLY LOGIN",
            data: user,
            status: true,
            isVerified: user.isVerified,
            token: token || null
        })

    } catch (err) {
        res.status(500).json({ message: err, status: false });
    }
}

const OTPVerifyController = async (req, res) => {
    try {
        const { otp, email, id } = req.body
        console.log("req.body", req.body)

        const otpRes = await OTPModel.findOne({ email, otp, isUsed: false })
        console.log("otpRes", otpRes)

        if (!otpRes) {
            return res.json({
                message: "OTP InValid",
                status: false
            })
        }

        otpRes.isUsed = true
        await otpRes.save()

        await userModel.findOneAndUpdate({ email }, { isVerified: true })

        const PRIVATE_KEY = process.env.jwtPrivateKey
        const token = jwt.sign({ id }, PRIVATE_KEY)

        res.json({
            message: "Account verified",
            token,
            status: true
        })

    } catch (error) {
        console.log("error", error.message)
    }
}

const getUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id);
        res.status(200).json({
            status: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error, Try again later', status: false });
    }
}

const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required",
                status: false
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                status: false
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        await OTPModel.create({
            otp,
            email,
            isUsed: false
        });

        await sendPasswordResetMail(email, user, otp);

        res.status(200).json({
            message: "Password reset OTP sent to your email",
            status: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        });
    }
};

const resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                message: "All fields are required",
                status: false
            });
        }

        const otpRecord = await OTPModel.findOne({
            email,
            otp,
            isUsed: false
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                status: false
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await userModel.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        );

        otpRecord.isUsed = true;
        await otpRecord.save();

        res.status(200).json({
            message: "Password reset successfully",
            status: true
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
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
