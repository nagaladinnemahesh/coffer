import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeEmailWithGemini(emailText) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Analyze the email below and return ONLY valid JSON with:
- intent
- urgency (low | medium | high)
- summary
- suggestedAction

Email:
"""${emailText}"""
`,
            },
          ],
        },
      ],
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const cleaned = response.text
      .replace(/```json\s*/i, "")
      .replace(/```\s*/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini analysis error:", err.message);
    throw err;
  }
}
