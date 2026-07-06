import getEmbedding from "../embedding/embedder.js";
import vectorStore from "../vectorStore/vectorStore.js";

async function queryEngine(query, topK) {
  if (!query) {
    throw new Error("Query is required");
  }

  // 1. Embed query
  const queryVector = await getEmbedding(query);

  // 2. Search vector database
  const results = vectorStore.search(queryVector, topK);

  // 3. Return direct results without decision engine processing
  return {
    type: null,
    answer: results[0] ? results[0].chunk : "No relevant information found.",
    results: results.map(r => ({
      id: r.id,
      chunk: r.chunk,
      score: r.score,
      metadata: r.metadata
    }))
  };
}

export default queryEngine;
