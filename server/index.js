import "dotenv/config";
import mongoose from "mongoose";
import app from "./src/app.js";

async function startMongoDBAndRunServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MONGODB Connected");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log("Server Running");
    });
  } catch (err) {
    console.log("MONGODB Error: ", err);
    process.exit(1);
  }
}

startMongoDBAndRunServer();
