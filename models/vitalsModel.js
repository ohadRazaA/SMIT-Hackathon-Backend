import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    vitalType: {
        type: String,
        required: true,
        enum: ['blood_pressure', 'blood_sugar', 'weight', 'height', 'temperature', 'heart_rate', 'oxygen_saturation', 'cholesterol', 'other']
    },
    value: { 
        type: String, 
        required: true 
    },
    unit: { 
        type: String, 
        required: true 
    },
    readingDate: { 
        type: Date, 
        required: true 
    },
    notes: { 
        type: String 
    },
    isFromReport: { 
        type: Boolean, 
        default: false 
    },
    sourceFileId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'file' 
    },
    status: {
        type: String,
        enum: ['normal', 'high', 'low', 'critical'],
        default: 'normal'
    },
    normalRange: { 
        type: String 
    }
}, { timestamps: true });

const vitalsModel = mongoose.model('vitals', vitalsSchema);
export default vitalsModel;
