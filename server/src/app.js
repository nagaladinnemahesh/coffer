import express from "express";
import emailRoutes from "./routes/email.routes.js";
import cors from "cors";

import "dotenv/config";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/email", emailRoutes);

export default app;
