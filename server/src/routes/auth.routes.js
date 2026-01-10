import { Router } from "express"; // mini route handler
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const router = Router();

// register user, create new user account

router.post("/register", async (req, res) => {
  const { email, password } = req.body; // reads data from frontend payload

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // creating user in db
  const user = await User.create({
    email,
    password: hashedPassword,
  });

  return res.json({ message: "User registered successfully!" });
});

// user login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
    },
  });
});

export default router;
