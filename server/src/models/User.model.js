import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: "test-user-1",
    },
    name: String,
    email: String,
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
