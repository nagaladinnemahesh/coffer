import { Router } from "express";
import { analyzeEmailWithGemini } from "../services/gemini.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/analyze/:messageId", requireAuth, async (req, res) => {
  const { messageId } = req.params;

  const existing = await emailAnalysisModel.findOne({
    userId: req.user.id,
    messageId,
  });

  try {
    const { emailText } = req.body;

    if (!emailText) {
      return res.status(400).json({
        error: "Email text required",
      });
    }

    const analysis = await analyzeEmailWithGemini(emailText);
    res.json(analysis);
  } catch (err) {
    console.error("Gemini analyze error:", err.message);
    res.status(500).json({ error: "AI Analysis failed" });
  }
});

export default router;
