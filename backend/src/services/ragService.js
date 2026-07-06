import processDocument from "../modules/ingestion/documentProcessor.js";
import sectionize from "../modules/chunking/sectionizer.js";
import semanticChunker from "../modules/chunking/semanticChunker.js";
import buildMetadata from "../modules/chunking/metadataBuilder.js";
import getEmbedding from "../modules/embedding/embedder.js";
import indexChunks from "../modules/indexer/indexer.js";
import queryEngine from "../modules/query/queryEngine.js";
import vectorStore from "../modules/vectorStore/vectorStore.js";

async function ingest(text, filename, options = {}) {
  // 1. Process document
  const processedText = processDocument(text);

  // 2. Split into sections
  const sections = sectionize(processedText, filename);

  const chunkSize = options.chunkSize || 500;
  const chunkOverlap = options.chunkOverlap || 100;

  // 3. Chunk sections semantically
  const flatChunks = [];
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    const chunks = await semanticChunker(section.text, chunkSize, chunkOverlap);
    
    chunks.forEach((chunkText, chunkIndex) => {
      // Enrich chunk text with document and section titles to provide maximum semantic context
      const contextPrefix = [];
      if (filename) contextPrefix.push(`[Document: ${filename}]`);
      if (section.title && section.title !== "Untitled") {
        contextPrefix.push(`[Section: ${section.title}]`);
      }
      const prefix = contextPrefix.join(" ");
      const enrichedText = prefix ? `${prefix} ${chunkText}` : chunkText;

      flatChunks.push({
        text: enrichedText,
        title: section.title,
        sectionIndex,
        chunkIndex,
      });
    });
  }

  // 4. Build metadata
  const chunksWithMetadata = buildMetadata(flatChunks);

  // 5. Generate embeddings
  const embeddings = [];
  for (const chunk of chunksWithMetadata) {
    const embedding = await getEmbedding(chunk.text);
    embeddings.push(embedding);
  }

  // 6. Index chunks into vector store
  await indexChunks(chunksWithMetadata, embeddings);

  return chunksWithMetadata;
}

async function query(queryString, topK) {
  console.log(queryString)
  return await queryEngine(queryString, topK);
}

async function getDocuments() {
  const vectors = vectorStore.getAllVectors();
  const docMap = {};

  vectors.forEach((v) => {
    const title = v.metadata?.title || "Untitled";
    if (!docMap[title]) {
      docMap[title] = {
        name: title,
        chunks: 0,
        size: "N/A", // size isn't stored in vector metadata, but we can display "N/A"
        strategy: "Recursive Chunker",
        date: new Date().toISOString().split("T")[0],
      };
    }
    docMap[title].chunks += 1;
  });

  return Object.values(docMap);
}

async function deleteDocument(name) {
  vectorStore.deleteByTitle(name);
}

export default {
  ingest,
  query,
  getDocuments,
  deleteDocument,
};

