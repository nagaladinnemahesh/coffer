import axios from "axios";
import GmailAccount from "../models/GmailAccount.model.js";
import { getAccessTokenFromRefreshToken } from "./google.service.js";

export async function getInbox(userId) {
  const account = await GmailAccount.findOne({ user_id: userId });
  if (!account) throw new Error("No gmail account connected");

  const accessToken = await getAccessTokenFromRefreshToken(
    account.refresh_token
  );

  // getting list of emails

  const emailListResponse = await axios.get(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { maxResults: 20 },
    }
  );

  const emails = emailListResponse.data.messages || [];

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

  return detailedEmail;
}
