import { Router } from "express";
import { sendOAuthEmail } from "../services/email.service.js";
import {
  getGoogleAuthURL,
  getTokens,
  getUserProfile,
} from "../services/google.service.js";
import GmailAccount from "../models/GmailAccount.model.js";

const router = Router();

//redirect to google OAuth ---- step 1

router.get("/connect", (req, res) => {
  const url = getGoogleAuthURL();
  // console.log("googleurl:", url);
  return res.redirect(url);
});

// handle call back --------- step 2

router.get("/oauth/callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.status(400).json({ error: "Missing OAuth code" });
  }

  try {
    // exchange code for tokens
    const tokens = await getTokens({ code });
    // console.log("TOKENS: ", tokens);
    // return res.json({ tokens });
    const profile = await getUserProfile(tokens.access_token);
    await GmailAccount.findOneAndUpdate(
      { user_id: "test-user-1" },
      {
        gmail_email: profile.email,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expiry_date: Date.now() + tokens.expires_in * 1000,
      },
      { upsert: true }
    );

    console.log("Gmail connected:", profile.email);
    return res.redirect("http://localhost:5173/dashboard");
  } catch (err) {
    console.log(err.response?.data || err);
    return res.status(500).json({ error: "oauth failed" });
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
