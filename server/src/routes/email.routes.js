import { Router } from "express";
import { sendEmail } from "../services/email.service.js";

const router = Router();

router.get("/send", async (req, res) => {
  try {
    await sendEmail();
    return res.json({ message: "Email sent" });
  } catch (err) {
    console.log(err);
    return res.json(500).json({ error: "Failed to send email" });
  }
});

export default router;
