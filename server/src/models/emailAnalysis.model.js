import mongoose from "mongoose";

const emailAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      //   ref: "User",
      index: true,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
      //   unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    analysis: {
      intent: String,
      urgency: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      summary: String,
      suggestedAction: String,
    },
    cisJobId: {
      type: String,
      index: true,
    },
  },

  { timestamps: true }
);

// same gmail message id can be existed for different users, so creating a compound unique index

emailAnalysisSchema.index({ userId: 1, messageId: 1 }, { unique: true });

export default mongoose.model("EmailAnalysis", emailAnalysisSchema);
