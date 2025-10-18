import nodemailer from "nodemailer"
import { SignupEmailTemplate } from "./templates/emailTemplate.js";
import OTPModel from "./models/otp.js";

export const sendMail = async (email, user) => {
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
        to: email,
        subject: "User Signup",
        html: SignupEmailTemplate(user, otp)
    };

    await transporter.sendMail(mailOptions);

    await OTPModel.create({
        otp,
        email
    }, { timestamps: true })
}