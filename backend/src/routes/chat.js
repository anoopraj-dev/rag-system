import { Router } from "express";
import chatController from "../controllers/chatController.js";

const router = Router();

// Endpoint for chat querying (calls the LLM-integrated ChatService)
router.post("/chat", chatController.askQuestion);

export default router;
