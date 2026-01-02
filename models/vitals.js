import mongoose from "mongoose";

const vitalsSchema = new mongoose.Schema({
  bloodPressure: String,
  sugar: String,
  heartRate: String,
  weight: String,
  recordedAt: { type: Date, default: Date.now }
});

export default vitalsSchema;