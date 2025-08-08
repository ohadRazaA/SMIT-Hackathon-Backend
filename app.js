import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import userRoutes from './routes/authRoutes.js'
import dbConnection from "./config/db.js";
// import { authMiddleware } from "./middlewares/auth.js";
// import { cloudinaryUploader } from "./config/cloudinary.js";
// import upload from "./middlewares/multer.js";

dotenv.config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
dbConnection();
app.use("/api/auth", userRoutes);

app.get("/", (req, res) => {
    res.send("SERVER UP")

})
// app.post('/hello', upload.any("image") , async (req, res) => {
//         const filePath = req.files[0].path
//         const imageRes = await cloudinaryUploader.upload(filePath)
//         console.log("imageRes", imageRes)
//         res.json({
//             message: imageRes,
//             url: imageRes.secure_url,
//             status: true
//         })
// })

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));