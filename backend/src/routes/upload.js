import { Router } from "express";
import ragController from "../controllers/ragController.js";

const router = Router();

// Endpoint for uploading/indexing documents
router.post("/", ragController.uploadDocument);

// Endpoint for querying the RAG system
router.post("/query", ragController.queryRAG);

export default router;
