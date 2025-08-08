import multer from "multer";

const storage = multer.memoryStorage({
    destination: "./upload",
    filename: (req, file, cb) => {
        console.log("file" , file)
        cb(false, `${new Date().getTime()} - ${file.originalname}`)
    }
})


const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB in bytes
    }
})


export default upload