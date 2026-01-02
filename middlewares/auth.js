import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"
import { configDotenv } from "dotenv";
configDotenv();

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const isVerify = await jwt.verify(token, process.env.JWT_PRIVATE_KEY)

        if (isVerify?.id) {
            req.user = isVerify
            next()
        } else {
            res.status(401).json({
                message: "unAuthorized user"
            })
        }
    } catch (error) {
        res.status(401).json({
            message: "unAuthorized user",
            error: error.message
        })
    }

}


export const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const isVerify = await jwt.verify(token, process.env.JWT_PRIVATE_KEY)

        if (isVerify?.id) {
            const user = await userModel.findById(isVerify.id)

            if (user.type !== "admin") {
                return res.status(403).json({
                    message: "Only Admin can access this API!"
                })
            }
            req.user = isVerify 
            next()

        } else {
            res.status(401).json({
                message: "unAuthorized user"
            })
        }
    } catch (error) {
        res.status(401).json({
            message: "unAuthorized user"
        })
    }

}