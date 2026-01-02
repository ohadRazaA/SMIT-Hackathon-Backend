import fileModel from "../models/fileModel.js";
import vitalsModel from "../models/vitalsModel.js";
import aiInsightModel from "../models/aiInsightModel.js";
import userModel from "../models/userModel.js";
import { cloudinaryUploader } from "../config/cloudinary.js";
import { analyzeWithGemini } from "../utils/gemini.js";

// Upload health report
export const uploadReportController = async (req, res) => {
    try {
        console.log("Upload request received:", {
            body: req.body,
            files: req.files ? req.files.length : 0,
            user: req.user?.id
        });

        const { reportType, reportDate } = req.body;
        const userId = req.user.id;

        if (!req.files || req.files.length === 0) {
            console.log("No files uploaded");
            return res.status(400).json({
                message: "No file uploaded",
                status: false
            });
        }

        const file = req.files[0];
        console.log("File details:", {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: file.path
        });

        const fileType = file.mimetype.startsWith('image/') ? 'image' : 
                        file.mimetype === 'application/pdf' ? 'pdf' : 'document';

        console.log("Uploading to Cloudinary...");
        // Upload to Cloudinary
        const uploadResult = await cloudinaryUploader.upload(file.path, {
            resource_type: "auto",
            folder: "healthmate/reports"
        });

        console.log("Cloudinary upload successful:", uploadResult.public_id);

        // Save file record
        const newFile = new fileModel({
            userId,
            fileName: uploadResult.public_id,
            originalName: file.originalname,
            fileType,
            fileUrl: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            reportType,
            reportDate: new Date(reportDate),
            fileSize: file.size
        });

        const savedFile = await newFile.save();
        console.log("File saved to database:", savedFile._id);

        // Process with AI in background
        processFileWithAI(savedFile._id, uploadResult.secure_url, userId);

        res.status(201).json({
            message: "Report uploaded successfully",
            status: true,
            data: {
                fileId: savedFile._id,
                fileName: savedFile.originalName,
                fileUrl: savedFile.fileUrl,
                reportType: savedFile.reportType
            }
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            message: error.message,
            status: false
        });
    }
};

// Process file with AI
const processFileWithAI = async (fileId, fileUrl, userId) => {
    try {
        console.log(`Starting AI processing for file ${fileId}`);
        
        const analysis = await analyzeWithGemini(fileUrl);
        
        // Create AI insight
        const aiInsight = new aiInsightModel({
            fileId,
            userId,
            rawText: analysis.rawText,
            englishSummary: analysis.englishSummary,
            urduSummary: analysis.urduSummary,
            extractedData: analysis.extractedData,
            confidence: analysis.confidence
        });

        const savedInsight = await aiInsight.save();
        console.log(`AI insight created with ID: ${savedInsight._id}`);

        // Update file with AI insight
        await fileModel.findByIdAndUpdate(fileId, {
            aiInsightId: savedInsight._id,
            isProcessed: true
        });

        // Extract and save vitals
        if (analysis.extractedData.vitals && analysis.extractedData.vitals.length > 0) {
            console.log(`Extracting ${analysis.extractedData.vitals.length} vitals from report`);
            
            for (const vital of analysis.extractedData.vitals) {
                // Map vital names to our enum values
                const vitalTypeMap = {
                    'blood pressure': 'blood_pressure',
                    'blood sugar': 'blood_sugar',
                    'weight': 'weight',
                    'height': 'height',
                    'temperature': 'temperature',
                    'heart rate': 'heart_rate',
                    'oxygen saturation': 'oxygen_saturation',
                    'cholesterol': 'cholesterol'
                };
                
                const vitalType = vitalTypeMap[vital.name.toLowerCase()] || 'other';
                
                const vitalRecord = new vitalsModel({
                    userId,
                    vitalType,
                    value: vital.value,
                    unit: vital.unit,
                    readingDate: new Date(),
                    isFromReport: true,
                    sourceFileId: fileId,
                    status: vital.status || 'normal',
                    normalRange: vital.normalRange
                });
                await vitalRecord.save();
            }
        }

        console.log(`AI processing completed successfully for file ${fileId}`);

    } catch (error) {
        console.error("AI processing error:", error);
        
        // Update file to indicate processing failed
        try {
            await fileModel.findByIdAndUpdate(fileId, {
                isProcessed: false,
                processingError: error.message
            });
        } catch (updateError) {
            console.error("Failed to update file with error status:", updateError);
        }
    }
};

// Add manual vitals
export const addVitalsController = async (req, res) => {
    try {
        const { vitalType, value, unit, readingDate, notes } = req.body;
        const userId = req.user.id;

        const newVital = new vitalsModel({
            userId,
            vitalType,
            value,
            unit,
            readingDate: new Date(readingDate),
            notes,
            isFromReport: false
        });

        const savedVital = await newVital.save();

        res.status(201).json({
            message: "Vitals added successfully",
            status: true,
            data: savedVital
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        });
    }
};

// Get user's health timeline
export const getHealthTimelineController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate, type } = req.query;

        let query = { userId };
        
        if (startDate && endDate) {
            query.readingDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (type) {
            query.vitalType = type;
        }

        // Get vitals
        const vitals = await vitalsModel.find(query)
            .populate('sourceFileId', 'originalName fileUrl reportType')
            .sort({ readingDate: -1 });

        // Get files
        const files = await fileModel.find({ userId })
            .populate('aiInsightId')
            .sort({ reportDate: -1 });

        // Combine and sort by date
        const timeline = [
            ...vitals.map(v => ({ ...v.toObject(), type: 'vital' })),
            ...files.map(f => ({ ...f.toObject(), type: 'file' }))
        ].sort((a, b) => new Date(b.readingDate || b.reportDate) - new Date(a.readingDate || a.reportDate));

        res.status(200).json({
            message: "Health timeline retrieved successfully",
            status: true,
            data: timeline
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        });
    }
};

// Get file with AI insights
export const getFileInsightsController = async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;

        const file = await fileModel.findOne({ _id: fileId, userId })
            .populate('aiInsightId');

        if (!file) {
            return res.status(404).json({
                message: "File not found",
                status: false
            });
        }

        res.status(200).json({
            message: "File insights retrieved successfully",
            status: true,
            data: file
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        });
    }
};

// Get user dashboard data
export const getDashboardDataController = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get recent files
        const recentFiles = await fileModel.find({ userId })
            .populate('aiInsightId')
            .sort({ uploadedAt: -1 })
            .limit(5);

        // Get recent vitals
        const recentVitals = await vitalsModel.find({ userId })
            .sort({ readingDate: -1 })
            .limit(10);

        // Get vitals summary
        const vitalsSummary = await vitalsModel.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: "$vitalType",
                    latestValue: { $first: "$value" },
                    latestDate: { $first: "$readingDate" },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            message: "Dashboard data retrieved successfully",
            status: true,
            data: {
                recentFiles,
                recentVitals,
                vitalsSummary
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        });
    }
};

// Update user profile
export const updateProfileController = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Profile updated successfully",
            status: true,
            data: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
            status: false
        });
    }
};
