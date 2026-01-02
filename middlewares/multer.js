import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB in bytes
  },
  fileFilter: (req, file, cb) => {
    // Allow only PDFs for medical reports; other endpoints can still pass images, etc.
    if (file.fieldname === "report" && file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed for medical reports."));
    }
    cb(null, true);
  },
});

export default upload;