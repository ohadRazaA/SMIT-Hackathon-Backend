import { cloudinaryUploader } from "../config/cloudinary.js"

export const uploadImageController = async (req, res) => {
    try {
        const filePath = req.files[0].path;
        const imageRes = await cloudinaryUploader.upload(filePath)
        res.status(200).json({
            message: "IMAGE UPLOAD",
            url: imageRes.secure_url
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}