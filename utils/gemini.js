import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeWithGemini = async (fileUrl) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are a medical AI assistant. Analyze this medical report and provide comprehensive information.
        
        IMPORTANT INSTRUCTIONS:
        1. Extract ALL text content from the report accurately
        2. Provide a detailed, easy-to-understand summary in English
        3. Translate the summary to Roman Urdu (using English alphabet) for better accessibility
        4. Extract ALL vital signs, lab values, and measurements with their normal ranges
        5. Identify ALL medications with dosage, frequency, and duration
        6. Highlight any concerning values, abnormalities, or recommendations
        7. Provide a confidence score (0-1) based on text clarity and completeness
        
        For vital signs, use these normal ranges as reference:
        - Blood Pressure: 90-140/60-90 mmHg
        - Blood Sugar (Fasting): 70-100 mg/dL
        - Blood Sugar (Random): 70-140 mg/dL
        - Heart Rate: 60-100 bpm
        - Temperature: 97.8-99.1°F (36.5-37.3°C)
        - Oxygen Saturation: 95-100%
        - Cholesterol: <200 mg/dL
        - Weight: Varies by individual
        
        Please format the response as JSON with this EXACT structure:
        {
            "rawText": "complete extracted text content",
            "englishSummary": "detailed summary in plain English",
            "urduSummary": "summary in Roman Urdu using English alphabet",
            "extractedData": {
                "vitals": [
                    {
                        "name": "Blood Pressure",
                        "value": "120/80",
                        "unit": "mmHg",
                        "normalRange": "90-140/60-90",
                        "status": "normal"
                    }
                ],
                "medications": [
                    {
                        "name": "Medicine Name",
                        "dosage": "10mg",
                        "frequency": "twice daily",
                        "duration": "2 weeks"
                    }
                ],
                "recommendations": ["specific recommendation 1", "specific recommendation 2"],
                "concerns": ["specific concern 1", "specific concern 2"]
            },
            "confidence": 0.85
        }
        
        Report URL: ${fileUrl}
        
        If you cannot access the file or extract meaningful information, set confidence to 0.0 and provide appropriate fallback messages.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean and parse JSON response
        let cleanText = text.trim();
        
        // Remove markdown code blocks if present
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        // Try to find JSON object in the response
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanText = jsonMatch[0];
        }

        const analysis = JSON.parse(cleanText);
        
        // Validate and clean the analysis
        return {
            rawText: analysis.rawText || "No text extracted",
            englishSummary: analysis.englishSummary || "Unable to generate summary",
            urduSummary: analysis.urduSummary || "Summary generate nahi ho saka",
            extractedData: {
                vitals: Array.isArray(analysis.extractedData?.vitals) ? analysis.extractedData.vitals : [],
                medications: Array.isArray(analysis.extractedData?.medications) ? analysis.extractedData.medications : [],
                recommendations: Array.isArray(analysis.extractedData?.recommendations) ? analysis.extractedData.recommendations : [],
                concerns: Array.isArray(analysis.extractedData?.concerns) ? analysis.extractedData.concerns : []
            },
            confidence: typeof analysis.confidence === 'number' ? Math.max(0, Math.min(1, analysis.confidence)) : 0.5
        };

    } catch (error) {
        console.error("Gemini analysis error:", error);
        
        // Return fallback response based on error type
        let errorMessage = "The document could not be analyzed at this time.";
        let urduMessage = "Document analyze nahi ho saka.";
        
        if (error.message.includes('API_KEY')) {
            errorMessage = "AI service is temporarily unavailable. Please try again later.";
            urduMessage = "AI service temporarily unavailable hai. Baad mein try karein.";
        } else if (error.message.includes('quota')) {
            errorMessage = "AI service quota exceeded. Please try again later.";
            urduMessage = "AI service quota exceed ho gaya. Baad mein try karein.";
        } else if (error.message.includes('network')) {
            errorMessage = "Network error occurred. Please check your connection and try again.";
            urduMessage = "Network error aaya. Connection check karein aur dobara try karein.";
        }
        
        return {
            rawText: "Unable to extract text from the document",
            englishSummary: errorMessage,
            urduSummary: urduMessage,
            extractedData: {
                vitals: [],
                medications: [],
                recommendations: [],
                concerns: []
            },
            confidence: 0.0
        };
    }
};
