import axios from "axios";

export function getGoogleAuthURL() {
  const rootUrl = "http://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://mail.google.com",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
      "profile",
    ].join(" "),
  };

  const params = new URLSearchParams(options);

  return `${rootUrl}?${params.toString()}`;
}

export async function getTokens({ code }) {
  const url = "https://oauth2.googleapis.com/token";

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    grant_type: "authorization_code",
  };

  const res = await axios.post(url, new URLSearchParams(values), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return res.data;
}
