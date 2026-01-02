import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeMedicalReport = async (fileUrl) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
You are a medical assistant AI.

TASK:
1. Read the medical report
2. Explain it in SIMPLE English
3. Explain same in Roman Urdu
4. Highlight abnormal values
5. Suggest doctor questions
6. Suggest food advice
7. Add disclaimer

Return JSON ONLY.
`;

  const result = await model.generateContent([
    {
      fileData: {
        fileUri: fileUrl,
        mimeType: "application/pdf",
      },
    },
    prompt,
  ]);

  return JSON.parse(result.response.text());
};

// import { GoogleGenerativeAI, GoogleAIFileManager } from "@google/generative-ai";
// import { configDotenv } from "dotenv";

// configDotenv();

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// if (!GEMINI_API_KEY) {
//   console.warn(
//     "GEMINI_API_KEY is not set. Medical report analysis will not work until this is configured."
//   );
// }

// const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
// const fileManager = new GoogleAIFileManager(GEMINI_API_KEY || "");

// const MEDICAL_REPORT_MODEL = "gemini-1.5-pro";

// const buildMedicalReportPrompt = () => {
//   return `
// You are an AI medical assistant helping patients understand their lab and medical reports.

// You will be given a full medical report in PDF form. Carefully read all pages and extract the important clinical information.

// Return your answer STRICTLY as valid JSON only (no extra text), with this exact shape:
// {
//   "englishSummary": "string, simple friendly summary of the overall report in English.",
//   "romanUrduSummary": "string, the same summary but written in clear Roman Urdu.",
//   "abnormalFindings": [
//     "string items describing abnormal or concerning values, e.g. 'WBC is high', 'Hemoglobin is low'"
//   ],
//   "questionsForDoctor": [
//     "3 to 5 specific questions the patient should ask their doctor based on these findings."
//   ],
//   "dietSuggestions": {
//     "eat": [
//       "list of foods that may generally help given the report (whole grains, leafy vegetables, etc.)."
//     ],
//     "avoid": [
//       "list of foods to avoid or limit (e.g. very sugary foods if sugar is high, very salty foods if BP is high)."
//     ]
//   },
//   "homeRemedies": [
//     "safe lifestyle and home-based suggestions only (sleep, hydration, light exercise, stress management, etc.)."
//   ],
//   "disclaimer": "Always consult your doctor before making any decision."
// }

// Guidelines:
// - If you cannot find a particular value in the report, simply skip it; do NOT guess numeric values.
// - Be very clear and simple in language (for both English and Roman Urdu).
// - Roman Urdu should be easy to read for people in Pakistan/India (e.g. 'aap ka khon ka pressure thora sa zyada hai').
// - Explain abnormal values in plain language: what it means and why it may matter.
// - NEVER give medication names, doses, or medical prescriptions.
// - If the report is largely normal, say that clearly in a reassuring way.

// IMPORTANT:
// - Respond ONLY with the JSON object and nothing else.
// `.trim();
// };

// export const analyzeMedicalReportWithGemini = async (fileBuffer, fileName) => {
//   if (!GEMINI_API_KEY) {
//     throw new Error("GEMINI_API_KEY is not configured on the server.");
//   }

//   const uploadedFile = await fileManager.uploadFile({
//     file: fileBuffer,
//     mimeType: "application/pdf",
//     displayName: fileName,
//   });

//   const model = genAI.getGenerativeModel({
//     model: MEDICAL_REPORT_MODEL,
//   });

//   const prompt = buildMedicalReportPrompt();

//   const result = await model.generateContent({
//     contents: [
//       {
//         role: "user",
//         parts: [
//           {
//             fileData: {
//               fileUri: uploadedFile.file.uri,
//               mimeType: "application/pdf",
//             },
//           },
//           {
//             text: prompt,
//           },
//         ],
//       },
//     ],
//   });

//   const text = result.response.text();

//   let parsed;
//   try {
//     parsed = JSON.parse(text);
//   } catch (error) {
//     console.error("Failed to parse Gemini response as JSON:", text);
//     throw new Error("AI response was not valid JSON.");
//   }

//   return parsed;
// };


