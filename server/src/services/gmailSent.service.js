import axios from "axios";
import GmailAccount from "../models/GmailAccount.model.js";
import { getAccessTokenFromRefreshToken } from "./google.service.js";

export async function getSentEmails(userId, pageToken = null, maxResults = 10) {
  const account = await GmailAccount.findOne({ user_id: userId });
  if (!account) {
    throw new Error("No Gmail account connected");
  }

  let accessToken = account.access_token;

  if (!accessToken || Date.now() > account.expiry_date) {
    accessToken = await getAccessTokenFromRefreshToken(account.refresh_token);
    account.access_token = accessToken;
    account.expiry_date = Date.now() + 60 * 60 * 1000;
    await account.save();
  }

  // fetching sent messages only

  const listRes = await axios.get(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        maxResults,
        pageToken: pageToken || undefined,
        labelIds: ["SENT"],
      },
    }
  );

  const messages = listRes.data.messages || [];
  const nextPageToken = listRes.data.nextPageToken || null;

  const result = [];

  for (const msg of messages) {
    const detailRes = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          format: "metadata",
          metadataHeaders: ["To", "Subject"],
        },
      }
    );

    // const payload = detailRes.data.payload;
    const headers = detailRes.data.payload.headers;

    const to = headers.find((h) => h.name === "To")?.value || "";
    const subject = headers.find((h) => h.name === "Subject")?.value || "";
    const snippet = detailRes.data.snippet || "";

    result.push({
      id: msg.id,
      to,
      subject,
      snippet,
    });
  }

  return {
    messages: result,
    nextPageToken,
  };
}
