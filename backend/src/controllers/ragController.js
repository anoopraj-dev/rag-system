import ragService from "../services/ragService.js";
import extractTextFromFile from "../modules/ingestion/fileExtractor.js";

async function uploadDocument(req, res) {
  try {
    let text = req.body.text;
    let filename = undefined;

    if (req.file) {
      text = await extractTextFromFile(req.file);
      filename = req.file.originalname;
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text or file upload is required",
      });
    }

    const options = {
      chunkSize: req.body.chunkSize ? parseInt(req.body.chunkSize, 10) : 500,
      chunkOverlap: req.body.chunkOverlap ? parseInt(req.body.chunkOverlap, 10) : 100,
    };

    const indexedChunks = await ragService.ingest(text, filename, options);

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

    console.log(result)

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

async function getDocuments(req, res) {
  try {
    const documents = await ragService.getDocuments();
    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

async function deleteDocument(req, res) {
  try {
    const { name } = req.params;
    await ragService.deleteDocument(name);
    return res.status(200).json({
      success: true,
      message: `Document "${name}" deleted from vector store`,
    });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

export default {
  uploadDocument,
  queryRAG,
  getDocuments,
  deleteDocument,
};

