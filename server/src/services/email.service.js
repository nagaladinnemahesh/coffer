import nodemailer from "nodemailer";
import { google } from "googleapis";
import GmailAccount from "../models/GmailAccount.model.js";
import { getAccessTokenFromRefreshToken } from "./google.service.js";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export async function sendOAuthEmail(userId) {
  // console.log("REFRESH:", process.env.GOOGLE_REFRESH_TOKEN);
  // console.log("SMTP:", process.env.SMTP_EMAIL);

  const account = await GmailAccount.findOne({ user_id: userId });

  if (!account) {
    throw new Error("No gmail account connected");
  }

  const accessToken = await getAccessTokenFromRefreshToken(
    account.refresh_token
  );

  // const { token } = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: account.gmail_email,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: account.refresh_token,
      accessToken: accessToken,
    },
  });

  const mailOptions = {
    from: `Coffer <${account.gmail_email}`,
    to: "maheshnagaladinne21@gmail.com",
    subject: "testing oauth through saved token",
    text: "OAuth mail sent from coffer using saved refresh token!!!",
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}
