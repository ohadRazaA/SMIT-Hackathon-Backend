import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import userRoutes from './routes/authRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import dbConnection from "./config/db.js";

dotenv.config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
dbConnection();
app.use("/api/auth", userRoutes);
app.use("/api/health", healthRoutes);

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

// const PORT = process.env.PORT || 4000;
// For local development
// if (process.env.NODE_ENV !== 'production') {
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => console.log(`server running on http://localhost:${PORT}`))
// }

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server is running on port: ${PORT}`));

export default app