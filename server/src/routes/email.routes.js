import { Router } from "express";
import { sendOAuthEmail } from "../services/email.service.js";
import { getGoogleAuthURL, getTokens } from "../services/google.service.js";

const router = Router();

router.get("/connect", (req, res) => {
  const url = getGoogleAuthURL();
  // console.log("googleurl:", url);
  return res.redirect(url);
});

router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing code" });
  }

  try {
    const tokens = await getTokens({ code });
    console.log("TOKENS: ", tokens);
    return res.json({ tokens });
  } catch (err) {
    console.log(err.response?.data || err);
    return res.status(500).json({ error: "Token exchange failed" });
  }
});

router.get("/send-oauth", async (req, res) => {
  try {
    const result = await sendOAuthEmail();
    return res.json({ message: "oauth Email sent", result });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to send oauth email" });
  }
});

export default router;
