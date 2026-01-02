import mongoose from "mongoose";
import vitalsSchema from "./vitals.js";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Member" }],
    type: {
      type: String,
      enum: ["user", "admin", "vendor"],
      default: "user",
    },
    isVerified: { type: Boolean, default: false },
    TwoFAEnabled: { type: Boolean, default: false },
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/doxunnujg/image/upload/v1766140938/hi_fk5gyf.png",
      set: v => (v === '' ? undefined : v),
    },
    vitals: {
      type: vitalsSchema,
      default: () => ({}),
    },
    vitalsHistory: [vitalsSchema],
    AISummary: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model("user", userSchema);
export default userModel;
