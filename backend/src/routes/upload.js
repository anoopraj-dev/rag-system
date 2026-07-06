import { Router } from "express";
import multer from "multer";
import ragController from "../controllers/ragController.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Endpoint for uploading/indexing documents (accepts both JSON body and file uploads)
router.post("/upload", upload.single("file"), ragController.uploadDocument);

// Endpoint for querying the RAG system
router.post("/query", ragController.queryRAG);

// Endpoint for retrieving documents
router.get("/documents", ragController.getDocuments);

// Endpoint for deleting a document from vector store
router.delete("/documents/:name", ragController.deleteDocument);

export default router;

