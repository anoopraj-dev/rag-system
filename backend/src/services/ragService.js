import processDocument from "../modules/ingestion/documentProcessor.js";
import sectionize from "../modules/chunking/sectionizer.js";
import recursiveChunker from "../modules/chunking/recursiveChunker.js";
import buildMetadata from "../modules/chunking/metadataBuilder.js";
import getEmbedding from "../modules/embedding/embedder.js";
import indexChunks from "../modules/indexer/indexer.js";
import queryEngine from "../modules/query/queryEngine.js";

async function ingest(text) {
  // 1. Process document
  const processedText = processDocument(text);

  // 2. Split into sections
  const sections = sectionize(processedText);

  // 3. Chunk sections recursively
  const flatChunks = [];
  sections.forEach((section, sectionIndex) => {
    const chunks = recursiveChunker(section.text);
    chunks.forEach((chunkText, chunkIndex) => {
      flatChunks.push({
        text: chunkText,
        title: section.title,
        sectionIndex,
        chunkIndex,
      });
    });
  });

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

async function query(queryString, topK = 3) {
  return await queryEngine(queryString, topK);
}

export default {
  ingest,
  query,
};
