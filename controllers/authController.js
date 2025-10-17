import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"
import { SignupEmailTemplate } from "../templates/emailTemplate.js"

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

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.APP_PASSWORD,
            },
        });

        const otp = Math.floor(100000 + Math.random() * 900000);

        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: "User Signup",
            html: SignupEmailTemplate(user, otp)
        };

        const userEmail = await transporter.sendMail(mailOptions);

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

        const PRIVATE_KEY = process.env.jwtPrivateKey
        const token = jwt.sign({ id: user._id }, PRIVATE_KEY)
        res.status(200).json({
            message: "USER SUCCESSFULLY LOGIN",
            data: user,
            status: true,
            token
        })

    } catch (err) {
        res.status(500).json({ message: 'Server error, Try again later', status: false });
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

export {
    signupController,
    loginController,
    getUser
};