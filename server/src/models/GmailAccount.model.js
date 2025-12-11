import mongoose from "mongoose";

const GmailAccountSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    gmail_email: String,
    refresh_token: String,
    access_token: String,
    picture: String,
    expiry_date: Number,
  },
  { timestamps: true }
);

export default mongoose.model("GmailAccount", GmailAccountSchema);
