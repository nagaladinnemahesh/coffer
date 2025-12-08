import express from "express";
import emailRoutes from "./routes/email.routes.js";

import "dotenv/config";

const app = express();

app.use("/email", emailRoutes);

export default app;
