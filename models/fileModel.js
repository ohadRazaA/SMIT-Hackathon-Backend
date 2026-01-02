import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    fileName: { 
        type: String, 
        required: true 
    },
    originalName: { 
        type: String, 
        required: true 
    },
    fileType: { 
        type: String, 
        required: true,
        enum: ['pdf', 'image', 'document']
    },
    fileUrl: { 
        type: String, 
        required: true 
    },
    cloudinaryId: { 
        type: String, 
        required: true 
    },
    reportType: {
        type: String,
        required: true,
        enum: ['blood_test', 'urine_test', 'xray', 'ct_scan', 'mri', 'ecg', 'prescription', 'other']
    },
    reportDate: { 
        type: Date, 
        required: true 
    },
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    },
    fileSize: { 
        type: Number, 
        required: true 
    },
    isProcessed: { 
        type: Boolean, 
        default: false 
    },
    processingError: { 
        type: String 
    },
    aiInsightId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'aiinsight' 
    }
}, { timestamps: true });

const fileModel = mongoose.model('file', fileSchema);
export default fileModel;
