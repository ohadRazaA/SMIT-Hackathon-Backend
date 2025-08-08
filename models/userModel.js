import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
    roles: [{
        type: String,
        enum: ["user", "admin", "vendor"]
    }],
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now() }
});

export default mongoose.model('user', userSchema);