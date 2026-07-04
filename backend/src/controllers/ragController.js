import ragService from "../services/ragService.js";

async function uploadDocument(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text is required",
      });
    }

    const indexedChunks = await ragService.ingest(text);

    return res.status(200).json({
      success: true,
      message: "Document indexed into RAG system",
      totalChunks: indexedChunks.length,
    });
  } catch (error) {
    console.error("Error during document upload:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

async function queryRAG(req, res) {
  try {
    const { query, topK } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query is required",
      });
    }

    const limit = topK ? parseInt(topK, 10) : 3;
    const result = await ragService.query(query, limit);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error during search querying:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export default {
  uploadDocument,
  queryRAG,
};
