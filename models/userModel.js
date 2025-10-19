import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    type: {
        type: String,
        enum: ["user", "admin", "vendor"],
        default: "user"
    },
    isVerified: { type: Boolean, default: false },
    TwoFAEnabled: { type: Boolean, default: false },
    // Health-specific fields
    dateOfBirth: { type: Date },
    gender: { 
        type: String, 
        enum: ['male', 'female', 'other'] 
    },
    bloodType: { 
        type: String, 
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] 
    },
    medicalHistory: [String],
    allergies: [String],
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    preferences: {
        language: { 
            type: String, 
            enum: ['english', 'urdu', 'both'], 
            default: 'both' 
        },
        notifications: { 
            type: Boolean, 
            default: true 
        }
    },
    createdAt: { type: Date, default: Date.now() }
}, { timestamps: true });

const userModel = mongoose.model('user', userSchema);
export default userModel;