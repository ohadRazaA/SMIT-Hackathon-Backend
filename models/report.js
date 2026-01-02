import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    englishSummary: { type: String, trim: true },
    romanUrduSummary: { type: String, trim: true },
    abnormalFindings: [{ type: String, trim: true }],
    questionsForDoctor: [{ type: String, trim: true }],
    dietSuggestions: {
      eat: [{ type: String, trim: true }],
      avoid: [{ type: String, trim: true }],
    },
    homeRemedies: [{ type: String, trim: true }],
    disclaimer: { type: String, trim: true },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: "member", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pdfUrl: { type: String, required: true, trim: true },
    originalFileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, trim: true },
    size: { type: Number, required: true },
    analysis: analysisSchema,
  },
  { timestamps: true }
);

const reportModel = mongoose.model("Report", reportSchema);

export default reportModel;


