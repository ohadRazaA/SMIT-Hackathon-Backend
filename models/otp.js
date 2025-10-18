import mongoose from "mongoose";

const schema = new mongoose.Schema({
    otp: String,
    email: String,
    isUsed: {
        type: Boolean,
        default: false
    },
    createAt: {
        type: Date,
        default: Date.now()
    },
}, { timestamps: true });

const OTPModel = mongoose.model("otp", schema);

export default OTPModel;