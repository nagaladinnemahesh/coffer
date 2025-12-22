import mongoose, { mongo } from "mongoose";

const sentEmailSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    sentVia: {
      type: String,
      enum: ["Coffer", "gmail"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SentEmail", sentEmailSchema);
