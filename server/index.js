import "dotenv/config";
import mongoose from "mongoose";
import app from "./src/app.js";
// adding test user
import User from "./src/models/User.model.js";

async function startMongoDBAndRunServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MONGODB Connected");

    async function createTestUser() {
      const exists = await User.findById("test-user-1");
      if (!exists) {
        await User.create({
          _id: "test-user-1",
          name: "Test User",
          email: "test@gmail.com",
        });
        console.log("Test user created");
      }
    }

    await createTestUser();

    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (err) {
    console.log("MONGODB Error: ", err);
    process.exit(1);
  }
}

startMongoDBAndRunServer();
