import nodemailer from "nodemailer";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

export async function sendOAuthEmail() {
  console.log("REFRESH:", process.env.GOOGLE_REFRESH_TOKEN);
  console.log("SMTP:", process.env.SMTP_EMAIL);

  const { token } = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.SMTP_EMAIL,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: token,
    },
  });

  const mailOptions = {
    from: `Coffer <${process.env.SMTP_EMAIL}`,
    to: "maheshnagaladinne21@gmail.com",
    subject: "Testing OAuth Email",
    html: "<h1>OAuth mail sent from coffer!!!",
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
}
