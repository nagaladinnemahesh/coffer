import axios from "axios";

export function getGoogleAuthURL(userId) {
  const rootUrl = "http://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state: userId,
    scope: [
      // "https://mail.google.com",
      "https://www.googleapis.com/auth/gmail.send",
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      // "https://www.googleapis.com/auth/userinfo.profile",
      "openid",
      "profile",
      // "email",
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

export async function getUserProfile(access_token) {
  const res = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  return res.data;
}

export async function getAccessTokenFromRefreshToken(refresh_token) {
  const res = await axios.post("https://oauth2.googleapis.com/token", null, {
    params: {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token,
      grant_type: "refresh_token",
    },
  });

  return res.data.access_token;
}
