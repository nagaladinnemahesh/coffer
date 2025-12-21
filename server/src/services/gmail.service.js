import axios from "axios";
import GmailAccount from "../models/GmailAccount.model.js";
import EmailAnalysis from "../models/emailAnalysis.model.js";
import { analyzeEmailWithGemini } from "./gemini.service.js";
import { getAccessTokenFromRefreshToken } from "./google.service.js";

export async function getInbox(userId, pageToken = null, maxResults = 10) {
  // console.log(" Inbox API called for user:", userId);

  const account = await GmailAccount.findOne({ user_id: userId });
  if (!account) throw new Error("No gmail account connected");

  // token handling
  let accessToken = account.access_token;

  if (!accessToken || Date.now() > account.expiry_date) {
    // console.log(" Refreshing Gmail access token");
    accessToken = await getAccessTokenFromRefreshToken(account.refresh_token);
    account.access_token = accessToken;
    account.expiry_date = Date.now() + 60 * 60 * 1000;
    await account.save();
  }

  // fetch messagest list
  // console.log("Fetching inbox messages from Gmail");

  const listRes = await axios.get(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { maxResults, pageToken: pageToken || undefined },
    }
  );

  // console.log("Raw Gmail list response:", listRes.data);
  // console.log("Messages array:", listRes.data.messages);

  const messages = listRes.data.messages || [];
  const nextPageToken = listRes.data.nextPageToken || null;

  // console.log(` Gmail returned ${messages.length} messages`);

  const result = [];

  // -processing each message
  for (const msg of messages) {
    // console.log(" Processing message:", msg.id);

    const detailRes = await axios.get(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { format: "metadata", metadataHeaders: ["Subject", "From"] },
      }
    );

    const payload = detailRes.data.payload;
    const from = payload.headers.find((h) => h.name === "From")?.value || "";
    const subject =
      payload.headers.find((h) => h.name === "Subject")?.value || "";
    const snippet = detailRes.data.snippet || "";

    // analysis check
    let analysisDoc = await EmailAnalysis.findOne({
      userId,
      messageId: msg.id,
    });

    if (!analysisDoc) {
      console.log(" No analysis found. Creating pending record for:", msg.id);

      analysisDoc = await EmailAnalysis.findOneAndUpdate(
        { userId, messageId: msg.id },
        { $setOnInsert: { status: "pending" } },
        { new: true, upsert: true }
      );

      // backgruound gemini analysis
      // console.log(" Gemini analysis started for:", msg.id);

      analyzeEmailWithGemini(`${subject}\n${snippet}`)
        .then(async (analysis) => {
          analysisDoc.analysis = analysis;
          analysisDoc.status = "completed";
          await analysisDoc.save();
          console.log("✅ Gemini analysis completed for:", msg.id);
        })
        .catch(async (err) => {
          analysisDoc.status = "failed";
          await analysisDoc.save();
          console.error("❌ Gemini analysis failed for:", msg.id, err);
        });
    } else {
      console.log(
        " Existing analysis found:",
        msg.id,
        "Status:",
        analysisDoc.status
      );
    }

    result.push({
      id: msg.id,
      from,
      subject,
      snippet,
      analysis: analysisDoc.analysis || null,
      analysisStatus: analysisDoc.status,
    });
  }

  // console.log(" Inbox response sent for user:", userId);

  return { messages: result, nextPageToken };
}
