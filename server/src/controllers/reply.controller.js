import { createReplyDraft, getReplyJob } from "../services/cis.service.js";

export async function requestReplyDraft(req, res) {
  const { email, analysis, userPrompt } = req.body;

  if (!email || !analysis) {
    return res.status(400).json({ error: "Missing email or analysis" });
  }

  const cisPayload = {
    content_type: "email_reply",
    content: {
      original_email: {
        from: email.from,
        subject: email.subject,
        body: email.body,
      },
      analysis: {
        intent: analysis.intent,
        urgency: analysis.urgency,
        summary: analysis.summary,
      },
      context: {
        tone: "professional",
        user_intent: userPrompt || "reply_to_email",
      },
    },
    metadata: {
      source: "gmail",
      messageId: email.id,
    },
  };

  const job = await createReplyDraft(cisPayload);

  return res.json({
    jobId: job.job_id,
    status: job.status,
  });
}

export async function checkReplyStatus(req, res) {
  const { jobId } = req.params;
  if (!jobId || jobId === "undefined") {
    return res.status(400).json({
      error: "Invalid jobId",
    });
  }
  const job = await getReplyJob(jobId);
  return res.json(job);
}
