import axios from "axios";
import GmailAccount from "../models/GmailAccount.model.js";
import { getAccessTokenFromRefreshToken } from "./google.service.js";

export async function getInbox(userId, pageToken = null, maxResults = 10) {
  const account = await GmailAccount.findOne({ user_id: userId });
  if (!account) {
    throw new Error("No gmail account connected");
  }

  let accessToken = account.access_token;

  if (!accessToken || Date.now() > account.expiry_date) {
    if (!account.refresh_token) {
      throw new Error("No refresh token available");
    }
  }

  const newAccessToken = await getAccessTokenFromRefreshToken(
    account.refresh_token
  );

  accessToken = newAccessToken;

  account.access_token = newAccessToken;
  account.expiry_date = Date.now() + 60 * 60 * 1000;
  await account.save();

  // getting list of emails

  const emailListResponse = await axios.get(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { maxResults, pageToken: pageToken || undefined },
    }
  );

  const emails = emailListResponse.data.messages || [];
  const nextPageToken = emailListResponse.data.nextPageToken || null;

  // fetch details of each email

  const detailedEmail = [];

  for (const email of emails) {
    const emailResponse = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${email.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { format: "metadata", metadataHeaders: ["Subject", "From"] },
      }
    );

    const payload = emailResponse.data.payload;

    const from = payload.headers.find((h) => h.name === "From")?.value || "";
    const subject =
      payload.headers.find((h) => h.name === "Subject")?.value || "";
    const snippet = emailResponse.data.snippet || "";

    detailedEmail.push({ id: email.id, from, subject, snippet });
  }

  return {
    messages: detailedEmail,
    nextPageToken,
  };
}
