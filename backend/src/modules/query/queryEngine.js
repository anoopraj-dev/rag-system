import getEmbedding from "../embedding/embedder.js";
import vectorStore from "../vectorStore/vectorStore.js";

async function queryEngine(query, topK = 3) {
  if (!query) {
    throw new Error("Query is required");
  }

  // 1. Embed query
  const queryVector = await getEmbedding(query);

  // 2. Search vector database
  const results = vectorStore.search(queryVector, topK);

  // 3. Build context format
  const context = results
    .map((r, i) => `[#${i + 1}] ${r.chunk}`)
    .join("\n\n");

  return {
    query,
    results,
    context,
  };
}

export default queryEngine;
