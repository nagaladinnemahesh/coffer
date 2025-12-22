import axios from "axios";
import GmailAccount from "../models/GmailAccount.model.js";
import { getAccessTokenFromRefreshToken } from "./google.service.js";
import SentEmail from "../models/SentEmail.model.js";

export async function sendEmail(userId, { to, subject, body }) {
  // step1: getting user gmail account
  const account = await GmailAccount.findOne({ user_id: userId });
  if (!account) {
    throw new Error("Gmail not connected");
  }

  // step2: refresh access token if needed
  let accessToken = account.access_token;

  if (!accessToken || Date.now() > account.expiry_date) {
    accessToken = await getAccessTokenFromRefreshToken(account.refresh_token);

    account.access_token = accessToken;
    account.expiry_date = Date.now() + 60 * 60 * 1000;
    await account.save();
  }

  // step3: create email
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\n");

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // step4: send via gmail api

  const res = await axios.post(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      raw: encodedMessage,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const messageId = res.data.id;

  await SentEmail.findOneAndUpdate(
    { messageId },
    {
      userId,
      to,
      subject,
      sentVia: "coffer",
      sentAt: new Date(),
    },
    {
      upsert: true,
      new: true,
    }
  );

  return {
    messageId: res.data.id,
    threadId: res.data.threadId,
  };
}
