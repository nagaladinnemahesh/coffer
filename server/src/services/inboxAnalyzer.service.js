import EmailAnalysis from "../models/emailAnalysis.model.js";
import { analyzeEmailWithGemini } from "./gemini.service.js";

export async function triggerBackgroundAnalysis(userId, emails) {
  setTimeout(async () => {
    const emailsToAnalyze = emails.filter((e) => !e.analysis).slice(0, 2);

    for (const email of emailsToAnalyze.filter((e) => !e.analysis)) {
      try {
        // Create pending record first
        const record = await EmailAnalysis.findOneAndUpdate(
          { userId, messageId: email.id },
          {
            $setOnInsert: {
              userId,
              messageId: email.id,
              status: "pending",
            },
          },
          { upsert: true, new: true }
        );

        if (record.status !== "pending") {
          continue;
        }

        const emailText = `${email.subject}\n${email.snippet}`;
        const analysis = await analyzeEmailWithGemini(emailText);

        record.analysis = analysis;
        record.status = "completed";
        await record.save();
      } catch (err) {
        await EmailAnalysis.findOneAndUpdate(
          { userId, messageId: email.id },
          { status: "failed" }
        );
        console.error("Gemini failed:", err.message);
      }
    }
  }, 0);
}
