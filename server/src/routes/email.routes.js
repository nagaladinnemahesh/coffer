import { Router } from "express";
import { sendOAuthEmail } from "../services/email.service.js";
import { getInbox } from "../services/gmail.service.js";
import { sendEmail } from "../services/gmailSend.service.js";
import {
  getGoogleAuthURL,
  getTokens,
  getUserProfile,
} from "../services/google.service.js";
import GmailAccount from "../models/GmailAccount.model.js";
import axios from "axios";
import { requireAuth } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const router = Router();

//redirect to google OAuth ---- step 1

router.get("/connect", (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error: "Missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const url = getGoogleAuthURL(userId);
    return res.redirect(url);
  } catch (err) {
    console.log("oauth connect error: ", err);
    return res.status(401).json({ error: "Invalid token" });
  }
  // console.log("googleurl:", url);
});

router.get("/account", requireAuth, async (req, res) => {
  try {
    const account = await GmailAccount.findOne({ user_id: req.user.id });

    if (!account) {
      return res.json({ connected: false });
    }

    return res.json({
      connected: true,
      email: account.gmail_email,
      picture: account.picture,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to load account" });
  }
});

// inbox
router.get("/inbox", requireAuth, async (req, res) => {
  try {
    const { pageToken } = req.query;
    const data = await getInbox(req.user.id, pageToken, 10);
    return res.json({
      messages: data.messages,
      nextPageToken: data.nextPageToken,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to fetch inbox" });
  }
});

router.post("/disconnect", requireAuth, async (req, res) => {
  try {
    await GmailAccount.deleteOne({ user_id: req.user.id });
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to disconnect" });
  }
});

router.get("/avatar", requireAuth, async (req, res) => {
  try {
    const account = await GmailAccount.findOne({ user_id: req.user.id });
    if (!account || !account.picture) {
      return res.status(404).send("No Picture");
    }

    const imageUrl = account.picture + "?sz=200";
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    res.set("Content-Type", "image/jpeg");
    res.send(response.data);
  } catch (err) {
    console.log("avatar fetch error:", err);
    res.status(500).send("Failed to load avatar");
  }
});

// handle call back --------- step 2

router.get("/oauth/callback", async (req, res) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: "Missing OAuth data" });
  }

  const userId = state;
  const userExists = await User.findById(userId);
  if (!userExists) {
    return res.status(401).json({
      error: "Invalid OAuth user",
    });
  }

  try {
    // exchange code for tokens
    const tokens = await getTokens({ code });
    // console.log("TOKENS: ", tokens);
    // return res.json({ tokens });
    const profile = await getUserProfile(tokens.access_token);
    // await GmailAccount.findOneAndUpdate(
    //   { user_id: userId },
    //   {
    //     gmail_email: profile.email,
    //     refresh_token: tokens.refresh_token,
    //     access_token: tokens.access_token,
    //     picture: profile.picture,
    //     expiry_date: Date.now() + tokens.expires_in * 1000,
    //   },
    //   { upsert: true }
    // );

    const update = {
      gmail_email: profile.email,
      access_token: tokens.access_token,
      picture: profile.picture,
      expiry_date: Date.now() + tokens.expires_in * 1000,
    };

    if (tokens.refresh_token) {
      update.refresh_token = tokens.refresh_token;
    }

    await GmailAccount.findOneAndUpdate({ user_id: userId }, update, {
      upsert: true,
    });

    console.log("Gmail connected:", profile.email);
    const frontendURL = process.env.FRONTEND_URL;

    if (!frontendURL) {
      throw new Error("Frontend_url not set");
    }
    return res.redirect(`${frontendURL}/dashboard`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.status(500).json({
      error: "oauth failed",
      details: err.message,
    });
  }
});

// router.get("/send-oauth", requireAuth, async (req, res) => {
//   try {
//     const result = await sendOAuthEmail(req.user.id);
//     return res.json({ message: "oauth Email sent", result });
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ error: "Failed to send oauth email" });
//   }
// });

router.post("/send-oauth", requireAuth, async (req, res) => {
  try {
    const { to, subject, body } = req.body;

    await sendEmail(req.user.id, { to, subject, body });

    res.json({ success: true, message: "Email sent via Gmail api" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

export default router;
