import express from "express";
import { configDotenv } from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import vitalRoutes from "./routes/vitalRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dbConnection from "./config/db.js";

configDotenv();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
dbConnection();

app.use("/api/auth", authRoutes);
app.use("/api/health", memberRoutes);
app.use("/api/health", vitalRoutes);
app.use("/api/health", reportRoutes);

app.get("/", (req, res) => {
  res.send("SERVER UP");
});
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