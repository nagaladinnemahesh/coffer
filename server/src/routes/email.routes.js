import { Router } from "express";
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
import { getSentEmails } from "../services/gmailSent.service.js";
import SentEmail from "../models/SentEmail.model.js";

const router = Router();

// gmail connection flow

//redirect to google OAuth ---- step 1
router.get("/connect", (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
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

// handle call back --------- step 2
router.get("/oauth/callback", async (req, res) => {
  const frontendURL = process.env.FRONTEND_URL;

  if (!frontendURL) {
    console.error("FRONTEND_URL missing");
    return res.status(500).send("Server misconfigured");
  }

  try {
    const { code, state } = req.query;

    if (!code || !state) {
      console.error("Missing code/state");
      return res.redirect(`${frontendURL}/dashboard`);
    }

    const userId = state;

    const user = await User.findById(userId);
    if (!user) {
      console.error("Invalid OAuth user");
      return res.redirect(`${frontendURL}/dashboard`);
    }

    const tokens = await getTokens({ code });
    const profile = await getUserProfile(tokens.access_token);

    const existingAccount = await GmailAccount.findOne({ user_id: userId });

    const update = {
      gmail_email: profile.email,
      access_token: tokens.access_token,
      picture: profile.picture,
      expiry_date: Date.now() + tokens.expires_in * 1000,
    };

    if (tokens.refresh_token) {
      update.refresh_token = tokens.refresh_token;
    } else if (existingAccount?.refresh_token) {
      update.refresh_token = existingAccount.refresh_token;
    }

    await GmailAccount.findOneAndUpdate({ user_id: userId }, update, {
      upsert: true,
    });

    console.log("Gmail connected:", profile.email);
  } catch (err) {
    console.error("OAuth callback error:", err.response?.data || err.message);
  }

  // redirect exactly once
  return res.redirect(`${frontendURL}/dashboard`);
});

// check connected gmail account - step 3
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
  console.log(" /email/inbox route HIT");
  // return res.json({ok: true});
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

// fetch sent emails
router.get("/sent", requireAuth, async (req, res) => {
  try {
    const { pageToken } = req.query;

    const data = await getSentEmails(req.user.id, pageToken);

    //attach coffer badge info

    const sentIds = await SentEmail.find({
      userId: req.user.id,
      messageId: { $in: data.messages.map((m) => m.id) },
    }).select("messageId");

    const sentViaCofferSet = new Set(sentIds.map((s) => s.messageId));

    const messagesWithBadge = data.messages.map((m) => ({
      ...m,
      sentViaCoffer: sentViaCofferSet.has(m.id),
    }));
    res.json({
      messages: messagesWithBadge,
      nextPageToken: data.nextPageToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch sent emails" });
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

export default router;
