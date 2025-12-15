import express from "express";
import emailRoutes from "./routes/email.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";

import "dotenv/config";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

//routes

app.use("/auth", authRoutes);
app.use("/email", emailRoutes);
app.use("/inbox", emailRoutes);

export default app;
