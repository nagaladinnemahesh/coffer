import express from "express";
import {
  requestReplyDraft,
  checkReplyStatus,
} from "../controllers/reply.controller.js";

const router = express.Router();

router.get("/draft", (req, res) => {
  return res.status(400).json({
    error: "jobId is required",
  });
});
router.post("/draft", requestReplyDraft);
router.get("/draft/:jobId", checkReplyStatus);

export default router;
