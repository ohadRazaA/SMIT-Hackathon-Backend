import memberModel from "../models/member.js";
import reportModel from "../models/report.js";
import { cloudinaryUploader } from "../config/cloudinary.js";
import { analyzeMedicalReportWithGemini } from "../config/gemini.js";

const uploadPdfToCloudinary = (fileBuffer, originalFileName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinaryUploader.upload_stream(
      {
        resource_type: "raw",
        folder: "medical-reports",
        public_id: `${Date.now()}-${originalFileName}`,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const uploadAndAnalyzeReport = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded. Please attach a PDF file.",
      });
    }

    const file = req.file;

    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({
        message: "Only PDF files are allowed.",
      });
    }

    const member = await memberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Optional ownership check – only if member.user is set
    if (member.user && userId && String(member.user) !== String(userId)) {
      return res.status(403).json({
        message: "You are not allowed to upload reports for this member.",
      });
    }

    // 1) Upload PDF to Cloudinary (secure storage)
    const uploaded = await uploadPdfToCloudinary(file.buffer, file.originalname);

    // 2) Analyze report via Gemini
    const analysis = await analyzeMedicalReportWithGemini(
      file.buffer,
      file.originalname
    );

    // 3) Persist report + AI analysis
    const report = await reportModel.create({
      member: member._id,
      user: userId || undefined,
      pdfUrl: uploaded.secure_url,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      analysis,
    });

    // 4) Optionally update member level AI summary with latest English summary
    if (analysis.englishSummary) {
      member.AISummary = analysis.englishSummary;
      await member.save();
    }

    return res.status(201).json({
      message: "Report uploaded and analyzed successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Error uploading/analyzing report:", error);
    return res.status(500).json({
      message: "Failed to analyze report. Please try again later.",
    });
  }
};

export const getReportsForMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user?.id;

    const member = await memberModel.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (member.user && userId && String(member.user) !== String(userId)) {
      return res.status(403).json({
        message: "You are not allowed to view reports for this member.",
      });
    }

    const reports = await reportModel
      .find({ member: memberId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Reports fetched successfully.",
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({
      message: "Failed to fetch reports.",
    });
  }
};


