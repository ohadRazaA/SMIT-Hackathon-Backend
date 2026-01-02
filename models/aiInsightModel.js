import mongoose from 'mongoose';

const aiInsightSchema = new mongoose.Schema({
    fileId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'file', 
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    rawText: { 
        type: String, 
        required: true 
    },
    englishSummary: { 
        type: String, 
        required: true 
    },
    urduSummary: { 
        type: String, 
        required: true 
    },
    extractedData: {
        vitals: [{
            name: String,
            value: String,
            unit: String,
            normalRange: String,
            status: {
                type: String,
                enum: ['normal', 'high', 'low', 'critical'],
                default: 'normal'
            }
        }],
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            duration: String
        }],
        recommendations: [String],
        concerns: [String]
    },
    confidence: { 
        type: Number, 
        min: 0, 
        max: 1, 
        default: 0.8 
    },
    processedAt: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

const aiInsightModel = mongoose.model('aiinsight', aiInsightSchema);
export default aiInsightModel;
