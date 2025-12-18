import express from "express";
import emailRoutes from "./routes/email.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";

import "dotenv/config";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://coffer-eight.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by cors"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

//routes

app.use("/auth", authRoutes);
app.use("/email", emailRoutes);
app.use("/inbox", emailRoutes);

export default app;
