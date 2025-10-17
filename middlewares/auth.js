import jwt from "jsonwebtoken"
import userModel from "../models/userModel.js"

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const isVerify = await jwt.verify(token, process.env.jwtPrivateKey)

        if (isVerify?.id) {
            req.user = isVerify
            next()
        } else {
            res.status(401).json({
                message: "unAuthorized user"
            })
        }
    } catch (error) {   
        res.json({
            message: "unAuthorized user"
        })
    }

}


export const adminAuthMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const isVerify = await jwt.verify(token, process.env.jwtPrivateKey)

        if (isVerify?.id) {
            const user = await userModel.findById(isVerify.id)

            if (user.type !== "admin") {
                return res.status(403).json({
                    message: "Only Admin can access this API!",
                    status: false
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