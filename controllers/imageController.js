import { cloudinaryUploader } from "../config/cloudinary.js"

export const uploadImageController = async (req, res) => {
    try {
        const filePath = req.files[0].path;
        const imageRes = await cloudinaryUploader.upload(filePath)
        res.json({
            message: "IMAGE UPLOAD",
            url: imageRes.secure_url,
            status: true
        })

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        })
    }
}