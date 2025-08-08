import jwt from "jsonwebtoken"

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const isVerify = await jwt.verify(token, process.env.jwtPrivateKey)

        if (isVerify?.id) {
            console.log(req.user)
            req.user = isVerify
            console.log(req.user)
            next()
        } else {
            res.status(401).json({
                message: "unAuthorization user"
            })
        }
    } catch (error) {   
        res.json({
            message: "unAuthorization user"
        })
    }

}